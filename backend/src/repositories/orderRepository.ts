import { prisma } from '../config/prisma';
import { OrderStatus, FulfillmentMode, Prisma, ProductStatus, PaymentStatus, PaymentMethod, ReviewStatus } from '@prisma/client';
import { generateOrderNumber } from '../utils/orderUtils';

export interface OrderItemSnapshotInput {
  productId: string;
  sellerId: string;
  snapshotTitle: string;
  snapshotCondition: any;
  snapshotUnitPrice: Prisma.Decimal;
  snapshotIsbn?: string | null;
  snapshotImage?: string | null;
  quantity: number;
  totalPrice: Prisma.Decimal;
}

export class OrderRepository {
  async findOrderByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        buyer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        seller: { select: { id: true, storeName: true, sellerType: true, rating: true } },
        safeZone: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: { orderBy: { displayOrder: 'asc' } },
                category: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
        productReviews: {
          where: { status: ReviewStatus.PUBLISHED },
          select: { id: true, orderItemId: true, productId: true, rating: true, title: true, comment: true, createdAt: true, updatedAt: true },
        },
        sellerReviews: {
          where: { status: ReviewStatus.PUBLISHED },
          select: { id: true, sellerId: true, rating: true, comment: true, createdAt: true, updatedAt: true },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async findOrdersByBuyerId(buyerId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { buyerId };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          seller: { select: { id: true, storeName: true, sellerType: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findSellerOrderItems(sellerId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderItemWhereInput = { sellerId };

    const [total, items] = await Promise.all([
      prisma.orderItem.count({ where }),
      prisma.orderItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              buyer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
            },
          },
          product: {
            select: { id: true, title: true, price: true, images: { orderBy: { displayOrder: 'asc' } } },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async createOrderTransaction(data: {
    buyerId: string;
    primarySellerId: string;
    shippingAddressId: string;
    fulfillmentMode: FulfillmentMode;
    subtotal: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    items: OrderItemSnapshotInput[];
    cartId: string;
  }) {
    const {
      buyerId,
      primarySellerId,
      shippingAddressId,
      fulfillmentMode,
      subtotal,
      totalAmount,
      items,
      cartId,
    } = data;

    const orderNumber = generateOrderNumber();

    return prisma.$transaction(async (tx) => {
      // 1. Concurrency-Safe Inventory Check & Decrement
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product || product.deletedAt || product.status !== ProductStatus.ACTIVE) {
          const error: any = new Error(`Product "${item.snapshotTitle}" is no longer active on the marketplace.`);
          error.statusCode = 400;
          error.code = 'PRODUCT_UNAVAILABLE';
          throw error;
        }

        if (product.quantity < item.quantity) {
          const error: any = new Error(`Insufficient stock for "${item.snapshotTitle}". Available: ${product.quantity}, Requested: ${item.quantity}.`);
          error.statusCode = 400;
          error.code = 'INSUFFICIENT_STOCK';
          throw error;
        }

        const newQty = product.quantity - item.quantity;
        const newStatus = newQty === 0 ? ProductStatus.SOLD : ProductStatus.ACTIVE;

        await tx.product.update({
          where: { id: product.id },
          data: {
            quantity: newQty,
            status: newStatus,
          },
        });
      }

      // 2. Create Order Record
      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          sellerId: primarySellerId,
          shippingAddressId,
          fulfillmentMode,
          status: OrderStatus.COMPLETED,
          subtotal,
          totalAmount,
          platformFee: new Prisma.Decimal(0),
          deliveryFee: new Prisma.Decimal(0),
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              sellerId: i.sellerId,
              snapshotTitle: i.snapshotTitle,
              snapshotCondition: i.snapshotCondition,
              snapshotUnitPrice: i.snapshotUnitPrice,
              snapshotIsbn: i.snapshotIsbn || null,
              snapshotImage: i.snapshotImage || null,
              quantity: i.quantity,
              totalPrice: i.totalPrice,
            })),
          },
          statusHistory: {
            create: {
              newStatus: OrderStatus.COMPLETED,
              changedByUserId: buyerId,
              reason: 'Order placed & immediately delivered at checkout.',
            },
          },
        },
        include: {
          items: true,
          buyer: true,
          seller: true,
        },
      });

      // 3. Clear Cart Items
      await tx.cartItem.deleteMany({
        where: { cartId },
      });

      // 4. Create Payment Record & Settle Seller Balance Immediately
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          currency: 'INR',
          status: PaymentStatus.RELEASED_TO_SELLER,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          razorpayOrderId: `rzp_${orderNumber}`,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          paidAt: new Date(),
        },
      });

      if (primarySellerId) {
        await tx.sellerWallet.updateMany({
          where: { sellerId: primarySellerId },
          data: { clearedBalance: { increment: totalAmount } },
        });
      }

      return order;
    });
  }

  async cancelOrderTransaction(orderId: string, userId: string, reason?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        const error: any = new Error('Order not found.');
        error.statusCode = 404;
        error.code = 'ORDER_NOT_FOUND';
        throw error;
      }

      // Restore Inventory Stock
      for (const item of order.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const restoredQty = product.quantity + item.quantity;
            await tx.product.update({
              where: { id: product.id },
              data: {
                quantity: restoredQty,
                status: product.status === ProductStatus.SOLD ? ProductStatus.ACTIVE : product.status,
              },
            });
          }
        }
      }

      // Update Order Status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          statusHistory: {
            create: {
              previousStatus: order.status,
              newStatus: OrderStatus.CANCELLED,
              changedByUserId: userId,
              reason: reason || 'Order cancelled by buyer.',
            },
          },
        },
        include: {
          items: true,
        },
      });

      return updated;
    });
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return null;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            previousStatus: order.status,
            newStatus,
            changedByUserId: userId,
            reason: reason || 'Order status updated.',
          },
        },
      },
      include: { items: true },
    });
  }
}

export const orderRepository = new OrderRepository();
