import { prisma } from '../config/prisma';
import { NotificationType, Prisma } from '@prisma/client';

export class NotificationRepository {
  async getOrCreatePreferences(userId: string) {
    const existing = await prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return prisma.notificationPreference.create({
      data: { userId },
    });
  }

  async updatePreferences(userId: string, data: {
    inAppEnabled?: boolean;
    emailEnabled?: boolean;
    orderUpdates?: boolean;
    messages?: boolean;
    reviews?: boolean;
    promotions?: boolean;
  }) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
    actionUrl?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data || null,
        actionUrl: data.actionUrl || null,
      },
    });
  }

  async getNotifications(userId: string, options: { page: number; limit: number; unreadOnly?: boolean }) {
    const { page, limit, unreadOnly } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications,
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

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async markAsRead(userId: string, id: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async deleteNotification(userId: string, id: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}

export const notificationRepository = new NotificationRepository();
