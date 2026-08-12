import { z } from 'zod';

export const createConversationSchema = z.object({
  sellerId: z.string().uuid('Invalid seller ID'),
  productId: z.string().uuid().optional(),
  initialMessage: z.string().trim().max(2000).optional(),
});

export const sendMessageSchema = z.object({
  messageText: z.string().trim().min(1, 'Message text cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
});

export const reportMessageSchema = z.object({
  reason: z.string().trim().min(3, 'Report reason must be at least 3 characters').max(500),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ReportMessageInput = z.infer<typeof reportMessageSchema>;
