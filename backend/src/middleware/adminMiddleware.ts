import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export function requireModerator(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  const allowedRoles = [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];
  if (!allowedRoles.includes(user.role as any)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Moderator access level required.' },
    });
  }

  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  const allowedRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
  if (!allowedRoles.includes(user.role as any)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Administrator access level required.' },
    });
  }

  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  if (user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Super Administrator access level required.' },
    });
  }

  next();
}
