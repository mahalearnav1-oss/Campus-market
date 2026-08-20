import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class PriceAlertRepository {
  async createOrUpdateAlert(userId: string, productId: string, targetPrice: number) {
    return prisma.priceAlert.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        targetPrice: new Prisma.Decimal(targetPrice),
        isActive: true,
        triggeredAt: null,
      },
      create: {
        userId,
        productId,
        targetPrice: new Prisma.Decimal(targetPrice),
        isActive: true,
        triggeredAt: null,
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async findAlert(userId: string, productId: string) {
    return prisma.priceAlert.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: {
        product: true,
      },
    });
  }

  async deactivateAlert(userId: string, productId: string) {
    return prisma.priceAlert.updateMany({
      where: {
        userId,
        productId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async deleteAlert(userId: string, productId: string) {
    return prisma.priceAlert.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  async getUserAlerts(userId: string, params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PriceAlertWhereInput = {
      userId,
      isActive: true,
      product: {
        deletedAt: null,
      },
    };

    const [alerts, total] = await Promise.all([
      prisma.priceAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { displayOrder: 'asc' },
              },
              category: true,
              college: true,
              seller: {
                select: {
                  id: true,
                  storeName: true,
                  rating: true,
                },
              },
            },
          },
        },
      }),
      prisma.priceAlert.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      alerts,
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

  async findTriggerableAlerts(productId: string, newPrice: number) {
    return prisma.priceAlert.findMany({
      where: {
        productId,
        isActive: true,
        targetPrice: {
          gte: new Prisma.Decimal(newPrice),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });
  }

  async markAlertsTriggered(alertIds: string[]) {
    if (alertIds.length === 0) return { count: 0 };
    return prisma.priceAlert.updateMany({
      where: {
        id: {
          in: alertIds,
        },
      },
      data: {
        isActive: false,
        triggeredAt: new Date(),
      },
    });
  }
}

export const priceAlertRepository = new PriceAlertRepository();
