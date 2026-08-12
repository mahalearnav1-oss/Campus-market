import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === 'production';

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    logger.warn(`Validation Error on ${req.method} ${req.path}`, { issues: err.issues });
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input data.',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // Handle Prisma Database Known Errors
  if (err.name === 'PrismaClientKnownRequestError') {
    logger.error(`Prisma Known Error on ${req.method} ${req.path}`, err);
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database query constraints violation.',
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = statusCode >= 500 && isProduction ? 'An unexpected server error occurred.' : err.message;

  logger.error(`API Error [${statusCode}] ${req.method} ${req.path}`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(!isProduction && err.stack ? { stack: err.stack } : {}),
    },
    meta: { timestamp: new Date().toISOString() },
  });
}
