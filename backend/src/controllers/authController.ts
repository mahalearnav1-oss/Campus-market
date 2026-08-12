import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema } from '../validators/authValidators';
import { REFRESH_COOKIE_NAME } from '../utils/tokenUtils';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = registerSchema.parse(req.body);
    const result = await authService.register(validatedInput, res, req.ip);
    res.status(201).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedInput = loginSchema.parse(req.body);
    const result = await authService.login(validatedInput, res, req.ip);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshTokenCookie = req.cookies[REFRESH_COOKIE_NAME];
    const result = await authService.refreshToken(refreshTokenCookie, res);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    await authService.logout(res, userId, req.ip);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await authService.getMe(userId);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const user = await authService.getMe(userId);
    res.status(200).json({
      success: true,
      data: { user },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function devPromoteAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required.' } });
    }
    const { prisma } = require('../config/prisma');
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: 'SUPER_ADMIN' },
    });
    res.status(200).json({
      success: true,
      data: { user: updated },
      message: 'Account promoted to SUPER_ADMIN successfully.',
    });
  } catch (error) {
    next(error);
  }
}
