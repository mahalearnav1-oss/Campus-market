import { paymentRepository } from '../repositories/paymentRepository';
import { orderRepository } from '../repositories/orderRepository';
import { prisma } from '../config/prisma';
import { RAZORPAY_KEY_ID, verifyRazorpaySignature, verifyWebhookSignature } from '../config/razorpay';
import { CreatePaymentOrderInput, VerifyPaymentInput, RetryPaymentInput } from '../validators/paymentValidators';
import { logAuditEvent } from '../utils/auditLogger';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import crypto from 'crypto';

export class PaymentService {
  async createPaymentOrder(userId: string, input: CreatePaymentOrderInput, ipAddress?: string) {
    const order = await orderRepository.findOrderByNumber(input.orderNumber);

    if (!order) {
      const error: any = new Error('Order not found.');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.buyerId !== userId) {
      const error: any = new Error('You are not authorized to create payment for this order.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (order.status === OrderStatus.PAID_ESCROW || order.status === OrderStatus.COMPLETED) {
      const error: any = new Error('This order has already been paid.');
      error.statusCode = 400;
      error.code = 'ALREADY_PAID';
      throw error;
    }

    if (order.status === OrderStatus.CANCELLED) {
      const error: any = new Error('Cannot create payment for a cancelled order.');
      error.statusCode = 400;
      error.code = 'ORDER_CANCELLED';
      throw error;
    }

    // Amount retrieved directly from MySQL database (in INR Decimal)
    const amountInINR = new Prisma.Decimal(order.totalAmount);
    const amountInPaise = Math.round(Number(amountInINR) * 100);

    // Create Razorpay Order Reference (Simulated/Official)
    const razorpayOrderId = `rzp_order_${crypto.randomBytes(8).toString('hex')}`;

    const payment = await paymentRepository.createOrUpdatePayment({
      orderId: order.id,
      razorpayOrderId,
      amount: amountInINR,
      currency: 'INR',
    });

    await paymentRepository.recordTransaction({
      paymentId: payment.id,
      gatewayReference: razorpayOrderId,
      status: 'ORDER_CREATED',
      rawPayload: JSON.stringify({ amountInPaise, currency: 'INR' }),
    });

    await logAuditEvent('PAYMENT_ORDER_CREATED', 'Payment', userId, payment.id, { razorpayOrderId, orderNumber: order.orderNumber }, ipAddress);

    return {
      keyId: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      razorpayOrderId,
      orderNumber: order.orderNumber,
      orderId: order.id,
    };
  }

  async verifyPayment(userId: string, input: VerifyPaymentInput, ipAddress?: string) {
    const payment = await paymentRepository.findPaymentByRazorpayOrderId(input.razorpay_order_id);

    if (!payment) {
      const error: any = new Error('Payment record not found for this Razorpay order.');
      error.statusCode = 404;
      error.code = 'PAYMENT_NOT_FOUND';
      throw error;
    }

    if (payment.order.buyerId !== userId) {
      const error: any = new Error('You are not authorized to verify payment for this order.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Idempotent Check: Prevent duplicate verification
    if (payment.status === PaymentStatus.CAPTURED_ESCROW) {
      return {
        verified: true,
        orderNumber: payment.order.orderNumber,
        paymentStatus: payment.status,
        message: 'Payment already verified.',
      };
    }

    // Verify HMAC SHA256 Signature
    const isValid = verifyRazorpaySignature(
      input.razorpay_order_id,
      input.razorpay_payment_id,
      input.razorpay_signature
    );

    if (!isValid) {
      await paymentRepository.updatePaymentStatus({
        paymentId: payment.id,
        status: PaymentStatus.FAILED,
      });

      await paymentRepository.recordTransaction({
        paymentId: payment.id,
        gatewayReference: input.razorpay_payment_id,
        status: 'SIGNATURE_FAILED',
        rawPayload: JSON.stringify(input),
      });

      const error: any = new Error('Invalid Razorpay payment signature verification failed.');
      error.statusCode = 400;
      error.code = 'INVALID_SIGNATURE';
      throw error;
    }

    // Atomic Status Updates (Payment -> CAPTURED_ESCROW, Order -> PAID_ESCROW)
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CAPTURED_ESCROW,
          razorpayPaymentId: input.razorpay_payment_id,
          razorpaySignature: input.razorpay_signature,
          paymentMethod: input.paymentMethod,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PAID_ESCROW,
          statusHistory: {
            create: {
              previousStatus: payment.order.status,
              newStatus: OrderStatus.PAID_ESCROW,
              changedByUserId: userId,
              reason: `Razorpay payment captured (${input.razorpay_payment_id}).`,
            },
          },
        },
      });
    });

    await paymentRepository.recordTransaction({
      paymentId: payment.id,
      gatewayReference: input.razorpay_payment_id,
      status: 'VERIFIED_SUCCESS',
      rawPayload: JSON.stringify(input),
    });

    await logAuditEvent('PAYMENT_VERIFIED', 'Payment', userId, payment.id, { razorpayPaymentId: input.razorpay_payment_id }, ipAddress);

    return {
      verified: true,
      orderNumber: payment.order.orderNumber,
      paymentStatus: PaymentStatus.CAPTURED_ESCROW,
      message: 'Razorpay payment successfully verified and funds placed in escrow!',
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    // Verify Webhook Signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      const error: any = new Error('Invalid Razorpay webhook signature.');
      error.statusCode = 400;
      error.code = 'INVALID_WEBHOOK_SIGNATURE';
      throw error;
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;

    if (!razorpayOrderId) {
      return { success: true, processed: false, reason: 'Missing order_id in webhook payload' };
    }

    const payment = await paymentRepository.findPaymentByRazorpayOrderId(razorpayOrderId);
    if (!payment) {
      return { success: true, processed: false, reason: 'Payment record not found' };
    }

    // Idempotency: Ignore already processed captured payments
    if (payment.status === PaymentStatus.CAPTURED_ESCROW && event === 'payment.captured') {
      return { success: true, processed: true, message: 'Already captured' };
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.CAPTURED_ESCROW,
            razorpayPaymentId: paymentEntity?.id || payment.razorpayPaymentId,
            paidAt: new Date(),
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID_ESCROW },
        });
      });

      await paymentRepository.recordTransaction({
        paymentId: payment.id,
        gatewayReference: paymentEntity?.id,
        status: 'WEBHOOK_PAYMENT_CAPTURED',
        rawPayload: rawBody,
      });
    } else if (event === 'payment.failed') {
      await paymentRepository.updatePaymentStatus({
        paymentId: payment.id,
        status: PaymentStatus.FAILED,
      });

      await paymentRepository.recordTransaction({
        paymentId: payment.id,
        gatewayReference: paymentEntity?.id,
        status: 'WEBHOOK_PAYMENT_FAILED',
        rawPayload: rawBody,
      });
    }

    return { success: true, processed: true, event };
  }

  async retryPayment(userId: string, input: RetryPaymentInput, ipAddress?: string) {
    return this.createPaymentOrder(userId, { orderNumber: input.orderNumber }, ipAddress);
  }

  async getPaymentStatus(userId: string, orderNumber: string) {
    const order = await orderRepository.findOrderByNumber(orderNumber);
    if (!order) {
      const error: any = new Error('Order not found.');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.buyerId !== userId) {
      const error: any = new Error('You are not authorized to view payment status for this order.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const payment = await paymentRepository.findPaymentByOrderId(order.id);
    return {
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            amount: payment.amount.toString(),
            currency: payment.currency,
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: payment.razorpayPaymentId,
            paymentMethod: payment.paymentMethod,
            paidAt: payment.paidAt,
          }
        : null,
    };
  }
}

export const paymentService = new PaymentService();
