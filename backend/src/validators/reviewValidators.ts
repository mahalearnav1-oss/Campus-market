import { z } from 'zod';

export const createProductReviewSchema = z.object({
  orderItemId: z.string().uuid('Invalid order item ID'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().min(5, 'Review comment must be at least 5 characters').max(2000),
});

export const updateProductReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().min(5).max(2000).optional(),
});

export const createSellerReviewSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().min(5, 'Seller review must be at least 5 characters').max(2000),
});

export type CreateProductReviewInput = z.infer<typeof createProductReviewSchema>;
export type UpdateProductReviewInput = z.infer<typeof updateProductReviewSchema>;
export type CreateSellerReviewInput = z.infer<typeof createSellerReviewSchema>;
