import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  collegeId: z.string().uuid('Please select a valid campus').optional().nullable(),
  role: z
    .nativeEnum(UserRole)
    .refine((val) => val !== UserRole.ADMIN && val !== UserRole.SUPER_ADMIN, {
      message: 'Administrator accounts cannot be registered directly.',
    })
    .optional()
    .default(UserRole.STUDENT_BUYER),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Please enter your password'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(250).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url('Please provide a valid image URL').optional().nullable(),
  collegeId: z.string().uuid('Please select a valid campus').optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter your current password'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
