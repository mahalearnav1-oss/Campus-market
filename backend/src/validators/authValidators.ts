import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address format').toLowerCase().trim(),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
  collegeId: z.string().uuid('Invalid college ID format').optional().nullable(),
  role: z
    .nativeEnum(UserRole)
    .refine((val) => val !== UserRole.ADMIN && val !== UserRole.SUPER_ADMIN, {
      message: 'Self-registration as Admin is prohibited',
    })
    .optional()
    .default(UserRole.STUDENT_BUYER),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(250).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
  collegeId: z.string().uuid('Invalid college ID format').optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
