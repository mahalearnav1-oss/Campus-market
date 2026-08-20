import { orderRepository, OrderItemSnapshotInput } from '../repositories/orderRepository';
import { cartRepository } from '../repositories/cartRepository';
import { prisma } from '../config/prisma';
import { CreateOrderInput, CancelOrderInput, UpdateSellerOrderStatusInput } from '../validators/orderValidators';
import { logAuditEvent } from '../utils/auditLogger';
import { OrderStatus, ProductStatus, Prisma, NotificationType } from '@prisma/client';
import { notificationService } from './notificationService';

export class OrderService {
  async getCheckoutPreview(userId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);

    if (cart.items.length === 0) {
      const error: any = new Error('Your cart is empty.');
      error.statusCode = 400;
      error.code = 'EMPTY_CART';
      throw error;
    }

    // Retrieve user's saved addresses (from Task 12)
    const userAddresses = await prisma.userAddress.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    let subtotal = new Prisma.Decimal(0);
    let totalItemCount = 0;
    let hasAvailabilityIssues = false;

    const previewItems = cart.items.map((item) => {
      const product = item.product;
      const unitPrice = new Prisma.Decimal(product.price);
      const lineTotal = unitPrice.mul(item.quantity);

      let isAvailable = true;
      let issueWarning: string | null = null;

      if (!product || product.deletedAt || product.status !== ProductStatus.ACTIVE) {
        isAvailable = false;
        issueWarning = 'This item is no longer available.';
        hasAvailabilityIssues = true;
      } else if (product.quantity < item.quantity) {
        isAvailable = false;
        issueWarning = `Only ${product.quantity} unit(s) available in stock.`;
        hasAvailabilityIssues = true;
      }

      if (isAvailable) {
        subtotal = subtotal.add(lineTotal);
        totalItemCount += item.quantity;
      }

      return {
        cartItemId: item.id,
        productId: product.id,
        title: product.title,
        conditionGrade: product.conditionGrade,
        unitPrice: unitPrice.toFixed(2),
        quantity: item.quantity,
        lineTotal: lineTotal.toFixed(2),
        isAvailable,
        issueWarning,
        seller: product.seller,
        image: product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || null,
      };
    });

    return {
      items: previewItems,
      addresses: userAddresses,
      subtotal: subtotal.toFixed(2),
      shippingAmount: '0.00',
      totalAmount: subtotal.toFixed(2),
      totalItemCount,
      hasAvailabilityIssues,
    };
  }

  async createOrder(userId: string, input: CreateOrderInput, ipAddress?: string) {
    const preview = await this.getCheckoutPreview(userId);

    if (preview.hasAvailabilityIssues) {
      const error: any = new Error('Some items in your cart are no longer available. Please review your cart.');
      error.statusCode = 400;
      error.code = 'CHECKOUT_VALIDATION_FAILED';
      throw error;
    }

    // Security Address Ownership Verification
    const address = await prisma.userAddress.findUnique({
      where: { id: input.shippingAddressId },
    });

    if (!address || address.userId !== userId) {
      const error: any = new Error('Please select a valid delivery address.');
      error.statusCode = 400;
      error.code = 'INVALID_ADDRESS';
      throw error;
    }

    const cart = await cartRepository.getOrCreateCart(userId);

    // Build OrderItem Snapshots
    const itemSnapshots: OrderItemSnapshotInput[] = cart.items.map((item) => {
      const p = item.product;
      const unitPrice = new Prisma.Decimal(p.price);
      const lineTotal = unitPrice.mul(item.quantity);
      const primaryImg = p.images?.find((i) => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || null;

      return {
        productId: p.id,
        sellerId: p.sellerId,
        snapshotTitle: p.title,
        snapshotCondition: p.conditionGrade,
        snapshotUnitPrice: unitPrice,
        snapshotIsbn: p.bookDetails?.isbn13 || null,
        snapshotImage: primaryImg,
        quantity: item.quantity,
        totalPrice: lineTotal,
      };
    });

    const primarySellerId = itemSnapshots[0].sellerId;
    const subtotal = new Prisma.Decimal(preview.subtotal);
    const totalAmount = new Prisma.Decimal(preview.totalAmount);

    const order = await orderRepository.createOrderTransaction({
      buyerId: userId,
      primarySellerId,
      shippingAddressId: address.id,
      fulfillmentMode: input.fulfillmentMode,
      paymentMethod: input.paymentMethod,
      subtotal,
      totalAmount,
      items: itemSnapshots,
      cartId: cart.id,
    });

    await logAuditEvent('ORDER_CREATED', 'Order', userId, order.id, { orderNumber: order.orderNumber, total: order.totalAmount.toString() }, ipAddress);

    // Trigger Real-time Notifications for Order Creation
    const seller = await prisma.seller.findUnique({ where: { id: primarySellerId } });
    if (seller) {
      await notificationService.notifyUser({
        userId: seller.userId,
        type: NotificationType.ORDER_CREATED,
        title: `🛒 New Order #${order.orderNumber}`,
        body: `You have received a new order for ₹${Number(order.totalAmount).toLocaleString('en-IN')}. Prepare shipment now.`,
        data: { orderNumber: order.orderNumber, orderId: order.id },
        actionUrl: `/seller/orders`,
      });
    }

    await notificationService.notifyUser({
      userId,
      type: NotificationType.ORDER_CREATED,
      title: `📦 Order Confirmed #${order.orderNumber}`,
      body: `Your order for ₹${Number(order.totalAmount).toLocaleString('en-IN')} has been placed successfully.`,
      data: { orderNumber: order.orderNumber, orderId: order.id },
      actionUrl: `/orders/${order.orderNumber}`,
    });

    return order;
  }

  async getBuyerOrders(userId: string, page: number = 1, limit: number = 20) {
    return orderRepository.findOrdersByBuyerId(userId, { page, limit });
  }

  async getOrderByNumber(userId: string, orderNumber: string) {
    const order = await orderRepository.findOrderByNumber(orderNumber);

    if (!order) {
      const error: any = new Error('We couldn\'t find this order.');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    // Security Ownership Check: Buyer OR Seller of item in order
    const isBuyer = order.buyerId === userId;
    const userSeller = await prisma.seller.findUnique({ where: { userId } });
    const isSeller = userSeller ? order.items.some((i) => i.sellerId === userSeller.id) : false;

    if (!isBuyer && !isSeller) {
      const error: any = new Error('You don\'t have permission to view this order.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const itemsWithReviewStatus = order.items.map((item) => {
      const existingReview = (order as any).productReviews?.find((r: any) => r.orderItemId === item.id) || null;
      return {
        ...item,
        canReview: isBuyer && order.status === OrderStatus.COMPLETED && !!item.productId && !existingReview,
        hasReviewed: !!existingReview,
        review: existingReview ? {
          id: existingReview.id,
          rating: existingReview.rating,
          title: existingReview.title,
          comment: existingReview.comment,
          createdAt: existingReview.createdAt,
          updatedAt: existingReview.updatedAt,
        } : null,
      };
    });

    const existingSellerReview = (order as any).sellerReviews?.[0] || null;

    return {
      ...order,
      items: itemsWithReviewStatus,
      sellerReview: existingSellerReview ? {
        id: existingSellerReview.id,
        rating: existingSellerReview.rating,
        comment: existingSellerReview.comment,
        createdAt: existingSellerReview.createdAt,
        updatedAt: existingSellerReview.updatedAt,
      } : null,
      canReviewSeller: isBuyer && order.status === OrderStatus.COMPLETED && !existingSellerReview,
      hasReviewedSeller: !!existingSellerReview,
    };
  }

  async cancelOrder(userId: string, orderNumber: string, input?: CancelOrderInput, ipAddress?: string) {
    const order = await orderRepository.findOrderByNumber(orderNumber);

    if (!order) {
      const error: any = new Error('We couldn\'t find this order.');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.buyerId !== userId) {
      const error: any = new Error('You don\'t have permission to cancel this order.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Eligible Status Check
    if (order.status !== OrderStatus.PAYMENT_PENDING && order.status !== OrderStatus.SELLER_ACCEPTED) {
      const error: any = new Error('This order can no longer be cancelled.');
      error.statusCode = 400;
      error.code = 'CANCEL_NOT_ALLOWED';
      throw error;
    }

    const cancelledOrder = await orderRepository.cancelOrderTransaction(order.id, userId, input?.reason);
    await logAuditEvent('ORDER_CANCELLED', 'Order', userId, order.id, { orderNumber }, ipAddress);
    return cancelledOrder;
  }

  async getSellerOrders(userId: string, sellerId: string, page: number = 1, limit: number = 20) {
    return orderRepository.findSellerOrderItems(sellerId, { page, limit });
  }

  async updateSellerOrderStatus(userId: string, sellerId: string, orderItemId: string, input: UpdateSellerOrderStatusInput, ipAddress?: string) {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem || orderItem.sellerId !== sellerId) {
      const error: any = new Error('We couldn\'t find this order item or you don\'t have permission to modify it.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Controlled Status Transitions
    const allowedTransitions: Record<string, OrderStatus[]> = {
      PAYMENT_PENDING: [OrderStatus.PAID_ESCROW, OrderStatus.SELLER_ACCEPTED, OrderStatus.CANCELLED],
      PAID_ESCROW: [OrderStatus.SELLER_ACCEPTED, OrderStatus.CANCELLED],
      SELLER_ACCEPTED: [OrderStatus.DELIVERED_PENDING_INSPECTION, OrderStatus.CANCELLED],
      DELIVERED_PENDING_INSPECTION: [OrderStatus.COMPLETED],
    };

    const currentStatus = orderItem.order.status;
    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(input.status)) {
      const error: any = new Error('This order cannot be updated to the requested status.');
      error.statusCode = 400;
      error.code = 'INVALID_STATUS_TRANSITION';
      throw error;
    }

    const updatedOrder = await orderRepository.updateOrderStatus(orderItem.orderId, input.status, userId, input.reason);
    await logAuditEvent('SELLER_ORDER_UPDATED', 'Order', userId, orderItem.orderId, { newStatus: input.status }, ipAddress);
    return updatedOrder;
  }
}

export const orderService = new OrderService();
