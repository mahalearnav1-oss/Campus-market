import { z } from 'zod';

export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
});

export const updateNotificationPreferencesSchema = z.object({
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  messages: z.boolean().optional(),
  reviews: z.boolean().optional(),
  promotions: z.boolean().optional(),
});

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
