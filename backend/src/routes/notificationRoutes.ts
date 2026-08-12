import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from '../controllers/notificationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/notifications', requireAuth, getNotifications);
router.get('/notifications/unread-count', requireAuth, getUnreadCount);
router.patch('/notifications/:id/read', requireAuth, markAsRead);
router.post('/notifications/read-all', requireAuth, markAllAsRead);
router.delete('/notifications/:id', requireAuth, deleteNotification);

// Notification Preferences
router.get('/users/me/notification-preferences', requireAuth, getPreferences);
router.patch('/users/me/notification-preferences', requireAuth, updatePreferences);

export default router;
