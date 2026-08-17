import { z } from 'zod';
import { ConditionGrade, SellerType } from '@prisma/client';

export const bookDetailsSchema = z.object({
  isbn13: z.string().trim().optional().nullable(),
  isbn10: z.string().trim().optional().nullable(),
  author: z.string().trim().min(1, 'Author name is required').max(100),
  publisher: z.string().trim().max(100).optional().nullable(),
  edition: z.string().trim().max(50).optional().nullable(),
  courseCode: z.string().trim().max(30).optional().nullable(),
});

export const createProductSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional().nullable(),
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().trim().optional().default('Clean secondhand campus item in good condition.'),
  conditionGrade: z.nativeEnum(ConditionGrade, { required_error: 'Condition grade is required' }).default(ConditionGrade.GOOD),
  conditionNotes: z.string().trim().optional().default('In good usable condition for campus courses.'),
  price: z.number().positive('Price must be greater than 0').max(1000000),
  originalMsrp: z.number().positive().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional().default(1),
  allowedFulfillments: z.string().optional().default('CAMPUS_MEETUP,COURIER_SHIPPING'),
  bookDetails: bookDetailsSchema.optional().nullable(),
  images: z.array(z.object({
    imageUrl: z.string().min(1, 'Image URL is required'),
    isPrimary: z.boolean().optional().default(false),
    displayOrder: z.number().int().optional().default(0),
  })).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productDiscoveryQuerySchema = z.object({
  q: z.string().trim().max(100, 'Search query cannot exceed 100 characters').optional(),
  categoryId: z.string().optional(),
  category: z.string().optional(),
  subcategoryId: z.string().optional(),
  minPrice: z.coerce.number().min(0, 'Min price cannot be negative').optional(),
  maxPrice: z.coerce.number().min(0, 'Max price cannot be negative').optional(),
  condition: z.nativeEnum(ConditionGrade).optional(),
  sellerType: z.nativeEnum(SellerType).optional(),
  collegeId: z.string().optional(),
  campusId: z.string().optional(),
  availableOnly: z.coerce.boolean().optional().default(true),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'recently_updated']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductDiscoveryQueryInput = z.infer<typeof productDiscoveryQuerySchema>;
