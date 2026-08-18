import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export function requireModerator(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' },
    });
  }

  const allowedRoles = [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];
  if (!allowedRoles.includes(user.role as any)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You don\'t have permission to access moderation tools.' },
    });
  }

  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' },
    });
  }

  const allowedRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
  if (!allowedRoles.includes(user.role as any)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You don\'t have permission to access the administration dashboard.' },
    });
  }

  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' },
    });
  }

  if (user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You don\'t have permission to perform this action.' },
    });
  }

  next();
}
