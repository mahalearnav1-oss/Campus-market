import { prisma } from '../config/prisma';
import { PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';

export class PaymentRepository {
  async createOrUpdatePayment(data: {
    orderId: string;
    razorpayOrderId: string;
    amount: Prisma.Decimal;
    currency?: string;
  }) {
    const { orderId, razorpayOrderId, amount, currency = 'INR' } = data;

    const existing = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (existing) {
      return prisma.payment.update({
        where: { id: existing.id },
        data: {
          razorpayOrderId,
          amount,
          currency,
          status: PaymentStatus.PENDING,
        },
      });
    }

    return prisma.payment.create({
      data: {
        orderId,
        razorpayOrderId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.UPI,
      },
    });
  }

  async findPaymentByRazorpayOrderId(razorpayOrderId: string) {
    return prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: {
        order: {
          include: {
            buyer: true,
            items: true,
          },
        },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findPaymentByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async updatePaymentStatus(data: {
    paymentId: string;
    status: PaymentStatus;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentMethod?: PaymentMethod;
  }) {
    const { paymentId, status, razorpayPaymentId, razorpaySignature, paymentMethod } = data;

    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        ...(razorpaySignature ? { razorpaySignature } : {}),
        ...(paymentMethod ? { paymentMethod } : {}),
        ...(status === PaymentStatus.CAPTURED_ESCROW ? { paidAt: new Date() } : {}),
      },
    });
  }

  async recordTransaction(data: {
    paymentId: string;
    gatewayReference?: string;
    status: string;
    rawPayload?: string;
  }) {
    const { paymentId, gatewayReference, status, rawPayload } = data;

    return prisma.paymentTransaction.create({
      data: {
        paymentId,
        gateway: 'RAZORPAY',
        gatewayReference: gatewayReference || null,
        status,
        rawPayload: rawPayload || null,
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();
