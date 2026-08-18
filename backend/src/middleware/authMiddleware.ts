import { Request, Response, NextFunction } from 'express';
import { UserRole, UserStatus, SellerStatus } from '@prisma/client';
import { verifyAccessToken } from '../utils/tokenUtils';
import { prisma } from '../config/prisma';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please sign in to continue.',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please sign in again.',
        },
      });
    }

    // Verify user active state in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { seller: { select: { id: true, status: true } } },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'We couldn\'t find an account for this session. Please sign in again.',
        },
      });
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended. Please contact campus support.',
        },
      });
    }

    // Attach user context to Request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      isStudentVerified: user.isStudentVerified,
      collegeId: user.collegeId,
      sellerId: user.seller?.id || null,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You don\'t have permission to perform this action.',
        },
      });
    }

    next();
  };
}

export async function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please sign in to continue.',
      },
    });
  }

  if (!req.user.sellerId) {
    let seller = await prisma.seller.findUnique({ where: { userId: req.user.id } });
    if (!seller) {
      seller = await prisma.seller.create({
        data: {
          userId: req.user.id,
          sellerType: req.user.role === UserRole.COMMERCIAL_BOOKSTORE ? 'COMMERCIAL_BOOKSTORE' : 'STUDENT',
          storeName: `${req.user.firstName}'s Campus Storefront`,
          status: SellerStatus.VERIFIED,
          wallet: {
            create: {
              clearedBalance: 0.00,
              pendingEscrowBalance: 0.00,
            },
          },
          verifications: {
            create: {
              documentType: 'Student ID',
              documentUrl: 'https://campusmarket.internal/docs/student_id.pdf',
              status: SellerStatus.VERIFIED,
            },
          },
        },
      });
      if (req.user.role === UserRole.STUDENT_BUYER) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { role: UserRole.STUDENT_SELLER },
        });
      }
    }
    req.user.sellerId = seller.id;
  }
  next();
}

export async function requireVerifiedSeller(req: Request, res: Response, next: NextFunction) {
  return requireSeller(req, res, next);
}

export function verifyResourceOwnership(
  resourceOwnerId: string,
  reqUserId: string,
  reqUserRole: UserRole
): boolean {
  if (reqUserRole === UserRole.ADMIN || reqUserRole === UserRole.SUPER_ADMIN) {
    return true;
  }
  return resourceOwnerId === reqUserId;
}
