import { UserRole, UserStatus } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  collegeId?: string | null;
  sellerId?: string | null;
}

export interface UserContext {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isStudentVerified: boolean;
  collegeId?: string | null;
  course?: string | null;
  semester?: number | null;
  sellerId?: string | null;
  sellerStatus?: string | null;
}

export interface SafeUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  isStudentVerified: boolean;
  collegeId?: string | null;
  course?: string | null;
  semester?: number | null;
  college?: { id: string; name: string; code: string; city?: string; state?: string } | null;
  sellerId?: string | null;
  sellerStatus?: string | null;
  createdAt: Date;
}
