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

export function isValidImageUrl(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  // Local/relative uploaded paths or assets
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return /^\/(api\/v1\/uploads|uploads|images|static)\/[^\s]+$/i.test(trimmed);
  }

  // Base64 Data URLs
  if (trimmed.startsWith('data:image/')) {
    return /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/i.test(trimmed);
  }

  // Web URLs (HTTP / HTTPS)
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const productImageItemSchema = z.object({
  imageUrl: z.string()
    .trim()
    .min(1, 'Image URL is required')
    .refine(
      (val) => isValidImageUrl(val),
      { message: 'Please provide a valid web image URL (starting with http:// or https://) or upload a photo.' }
    ),
  isPrimary: z.boolean().optional().default(false),
  displayOrder: z.number().int().optional().default(0),
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
  targetBranch: z.string().trim().max(100, 'Target branch cannot exceed 100 characters').optional().nullable(),
  targetSemester: z.coerce.number().int().min(1, 'Target semester must be between 1 and 12').max(12, 'Target semester must be between 1 and 12').optional().nullable(),
  bookDetails: bookDetailsSchema.optional().nullable(),
  images: z.array(productImageItemSchema).min(1, 'At least one clear photo of the actual product is required'),
});

export const updateProductSchema = createProductSchema.partial().refine(
  (data) => data.images === undefined || data.images.length > 0,
  { message: 'Product must have at least one product photo.', path: ['images'] }
);

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
  branch: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  forYou: z.coerce.boolean().optional(),
  availableOnly: z.coerce.boolean().optional().default(true),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'recently_updated']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductDiscoveryQueryInput = z.infer<typeof productDiscoveryQuerySchema>;
