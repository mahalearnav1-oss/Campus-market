import { z } from 'zod';

export const createProductReviewSchema = z.object({
  orderItemId: z.string().uuid('Invalid order item ID'),
  rating: z.number().int('Rating must be a whole number').min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters').optional().nullable(),
  comment: z.string().trim().max(2000, 'Review comment cannot exceed 2000 characters').optional().default(''),
});

export const updateProductReviewSchema = z.object({
  rating: z.number().int('Rating must be a whole number').min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5').optional(),
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters').optional().nullable(),
  comment: z.string().trim().max(2000, 'Review comment cannot exceed 2000 characters').optional(),
});

export const createSellerReviewSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  rating: z.number().int('Rating must be a whole number').min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(2000, 'Seller review cannot exceed 2000 characters').optional().default(''),
});

export type CreateProductReviewInput = z.infer<typeof createProductReviewSchema>;
export type UpdateProductReviewInput = z.infer<typeof updateProductReviewSchema>;
export type CreateSellerReviewInput = z.infer<typeof createSellerReviewSchema>;
