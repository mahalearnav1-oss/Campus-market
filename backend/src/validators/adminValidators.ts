import { z } from 'zod';
import { DisputeReason } from '@prisma/client';

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
  reason: z.string().trim().optional(),
});

export const verifySellerSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().trim().optional(),
});

export const updateProductStatusSchema = z.object({
  status: z.enum(['APPROVED', 'HIDDEN', 'REMOVED', 'ACTIVE', 'SUSPENDED']),
  reason: z.string().trim().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().trim().min(2, 'Slug must be at least 2 characters'),
  description: z.string().trim().optional(),
  displayOrder: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  displayOrder: z.number().int().optional(),
});

export const createReportSchema = z.object({
  targetType: z.enum(['PRODUCT', 'SELLER', 'USER', 'MESSAGE', 'REVIEW']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters'),
  description: z.string().trim().optional(),
});

export const resolveReportSchema = z.object({
  status: z.enum(['DISMISSED', 'RESOLVED']),
  resolutionNotes: z.string().trim().optional(),
});

export const createDisputeSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  reason: z.nativeEnum(DisputeReason),
  explanation: z.string().trim().min(10, 'Dispute explanation must be at least 10 characters'),
});

export const resolveDisputeSchema = z.object({
  status: z.enum(['RESOLVED', 'REJECTED']),
  resolutionNotes: z.string().trim().optional(),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type VerifySellerInput = z.infer<typeof verifySellerSchema>;
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
