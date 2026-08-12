import { z } from 'zod';
import { SellerType } from '@prisma/client';

export const applySellerSchema = z.object({
  sellerType: z.nativeEnum(SellerType, { required_error: 'Seller type is required (STUDENT or COMMERCIAL_BOOKSTORE)' }),
  storeName: z.string().trim().min(2, 'Store name must be at least 2 characters').max(100),
  bio: z.string().trim().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  businessRegNumber: z.string().trim().max(100).optional().nullable(),
  documentType: z.string().trim().min(2).optional().default('Student ID'),
  documentUrl: z.string().trim().min(5).optional().default('https://campusmarket.internal/docs/student_id.pdf'),
});

export const updateSellerProfileSchema = z.object({
  storeName: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  businessRegNumber: z.string().trim().max(100).nullable().optional(),
});

export const submitVerificationSchema = z.object({
  documentType: z.string().trim().min(2, 'Document type is required'),
  documentUrl: z.string().trim().min(5, 'Document URL is required'),
});

export type ApplySellerInput = z.infer<typeof applySellerSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
