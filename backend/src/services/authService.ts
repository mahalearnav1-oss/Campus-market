import { Response } from 'express';
import { userRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/tokenUtils';
import { RegisterInput, LoginInput } from '../validators/authValidators';
import { logAuditEvent } from '../utils/auditLogger';
import { UserStatus } from '@prisma/client';
import { SafeUserResponse } from '../types/auth.types';

export class AuthService {
  async register(input: RegisterInput, res: Response, ipAddress?: string) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      const error: any = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await userRepository.createUser({
      email: input.email,
      passwordHash: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      collegeId: input.collegeId,
    });

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      sellerId: user.seller?.id || null,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    setRefreshTokenCookie(res, refreshToken);

    await logAuditEvent('USER_REGISTER', 'User', user.id, user.id, { role: user.role }, ipAddress);

    const safeUser: SafeUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      isStudentVerified: user.isStudentVerified,
      collegeId: user.collegeId,
      course: user.course,
      semester: user.semester,
      college: (user as any).college || null,
      sellerId: user.seller?.id || null,
      sellerStatus: user.seller?.status || null,
      createdAt: user.createdAt,
    };

    return { user: safeUser, accessToken };
  }

  async login(input: LoginInput, res: Response, ipAddress?: string) {
    const user = await userRepository.findByEmail(input.email);
    
    // Generic error message to prevent account enumeration
    if (!user || !user.passwordHash) {
      await logAuditEvent('FAILED_LOGIN_ATTEMPT', 'User', null, null, { email: input.email }, ipAddress);
      const error: any = new Error('Email or password is incorrect.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
      const error: any = new Error('Your account has been suspended. Please contact campus support.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_SUSPENDED';
      throw error;
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent('FAILED_LOGIN_ATTEMPT', 'User', user.id, user.id, { reason: 'Invalid password' }, ipAddress);
      const error: any = new Error('Email or password is incorrect.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      sellerId: user.seller?.id || null,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    setRefreshTokenCookie(res, refreshToken);

    await logAuditEvent('USER_LOGIN', 'User', user.id, user.id, { role: user.role }, ipAddress);

    const safeUser: SafeUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isStudentVerified: user.isStudentVerified,
      collegeId: user.collegeId,
      course: user.course,
      semester: user.semester,
      college: (user as any).college || null,
      sellerId: user.seller?.id || null,
      sellerStatus: user.seller?.status || null,
      createdAt: user.createdAt,
    };

    return { user: safeUser, accessToken };
  }

  async refreshToken(cookieToken: string | undefined, res: Response) {
    if (!cookieToken) {
      const error: any = new Error('Your session could not be refreshed. Please sign in again.');
      error.statusCode = 401;
      error.code = 'MISSING_REFRESH_TOKEN';
      throw error;
    }

    let payload;
    try {
      payload = verifyRefreshToken(cookieToken);
    } catch (err) {
      clearRefreshTokenCookie(res);
      const error: any = new Error('Your session has expired. Please sign in again.');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
      clearRefreshTokenCookie(res);
      const error: any = new Error('Your account is unavailable. Please sign in again or contact campus support.');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      sellerId: user.seller?.id || null,
    };

    const newAccessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken: newAccessToken };
  }

  async logout(res: Response, userId?: string, ipAddress?: string) {
    clearRefreshTokenCookie(res);
    if (userId) {
      await logAuditEvent('USER_LOGOUT', 'User', userId, userId, {}, ipAddress);
    }
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error: any = new Error('We couldn\'t find an account for this user.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const safeUser: SafeUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isStudentVerified: user.isStudentVerified,
      collegeId: user.collegeId,
      course: user.course,
      semester: user.semester,
      college: user.college || null,
      sellerId: user.seller?.id || null,
      sellerStatus: user.seller?.status || null,
      createdAt: user.createdAt,
    };

    return { user: safeUser };
  }
}

export const authService = new AuthService();
