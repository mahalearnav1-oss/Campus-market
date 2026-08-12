import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().trim().min(1, 'Last name is required').max(50).optional(),
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').nullable().optional(),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').nullable().optional(),
  avatarUrl: z.string().url('Invalid avatar URL format').nullable().optional(),
  collegeId: z.string().uuid('Invalid college ID').nullable().optional(),
});

export const createAddressSchema = z.object({
  label: z.string().trim().min(1, 'Address label is required').max(30).default('Home'),
  recipientName: z.string().trim().min(1, 'Recipient name is required').max(100),
  phone: z.string().trim().min(7, 'Phone number is required').max(20),
  streetAddress: z.string().trim().min(5, 'Street address is required').max(200),
  dormOrBuilding: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  postalCode: z.string().trim().min(3, 'Postal code is required').max(20),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
