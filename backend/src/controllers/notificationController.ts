import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';
import { getNotificationsQuerySchema, updateNotificationPreferencesSchema } from '../validators/notificationValidators';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const query = getNotificationsQuerySchema.parse(req.query);

    const result = await notificationService.getNotifications(userId, query.page, query.limit, query.unreadOnly);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await notificationService.getUnreadCount(userId);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const result = await notificationService.markAsRead(userId, notificationId);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const result = await notificationService.deleteNotification(userId, notificationId);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const preferences = await notificationService.getPreferences(userId);
    res.status(200).json({
      success: true,
      data: { preferences },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = updateNotificationPreferencesSchema.parse(req.body);

    const preferences = await notificationService.updatePreferences(userId, validatedInput);
    res.status(200).json({
      success: true,
      data: { preferences },
      message: 'Notification preferences updated.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
