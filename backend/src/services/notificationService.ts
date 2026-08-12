import { notificationRepository } from '../repositories/notificationRepository';
import { emailService } from './emailService';
import { emitToUser } from '../realtime/socketServer';
import { NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma';

export class NotificationService {
  async notifyUser(params: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
    actionUrl?: string;
  }) {
    const { userId, type, title, body, data, actionUrl } = params;

    // Check user notification preferences
    const prefs = await notificationRepository.getOrCreatePreferences(userId);

    // Honor category preferences
    if (type === NotificationType.MESSAGE_RECEIVED && !prefs.messages) return null;
    const orderTypes: NotificationType[] = [
      NotificationType.ORDER_CREATED,
      NotificationType.PAYMENT_SUCCESS,
      NotificationType.PAYMENT_FAILED,
      NotificationType.SHIPMENT_CREATED,
      NotificationType.SHIPMENT_UPDATED,
      NotificationType.OUT_FOR_DELIVERY,
      NotificationType.DELIVERED,
    ];
    if (orderTypes.includes(type) && !prefs.orderUpdates) {
      return null;
    }
    const reviewTypes: NotificationType[] = [NotificationType.REVIEW_RECEIVED, NotificationType.REVIEW_REMINDER];
    if (reviewTypes.includes(type) && !prefs.reviews) {
      return null;
    }

    let notification = null;
    if (prefs.inAppEnabled) {
      notification = await notificationRepository.createNotification({
        userId,
        type,
        title,
        body,
        data,
        actionUrl,
      });

      const unreadCount = await notificationRepository.getUnreadCount(userId);

      // Emit real-time WebSocket push event
      emitToUser(userId, 'notification:new', {
        notification,
        unreadCount,
      });
      emitToUser(userId, 'unread_count:update', { count: unreadCount });
    }

    // Dispatch email if enabled
    if (prefs.emailEnabled) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await emailService.sendEmail({
          to: user.email,
          subject: title,
          html: `<div style="font-family: sans-serif; padding: 15px;"><h2>${title}</h2><p>${body}</p></div>`,
        });
      }
    }

    return notification;
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20, unreadOnly?: boolean) {
    return notificationRepository.getNotifications(userId, { page, limit, unreadOnly });
  }

  async getUnreadCount(userId: string) {
    const count = await notificationRepository.getUnreadCount(userId);
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    await notificationRepository.markAsRead(userId, notificationId);
    const unreadCount = await notificationRepository.getUnreadCount(userId);
    emitToUser(userId, 'unread_count:update', { count: unreadCount });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
    emitToUser(userId, 'unread_count:update', { count: 0 });
    return { success: true };
  }

  async deleteNotification(userId: string, notificationId: string) {
    await notificationRepository.deleteNotification(userId, notificationId);
    const unreadCount = await notificationRepository.getUnreadCount(userId);
    emitToUser(userId, 'unread_count:update', { count: unreadCount });
    return { success: true };
  }

  async getPreferences(userId: string) {
    return notificationRepository.getOrCreatePreferences(userId);
  }

  async updatePreferences(userId: string, data: any) {
    return notificationRepository.updatePreferences(userId, data);
  }
}

export const notificationService = new NotificationService();
