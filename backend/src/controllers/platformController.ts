import { Request, Response, NextFunction } from 'express';
import { platformService } from '../services/platformService';

export async function getPlatformStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await platformService.getPlatformStats();
    res.status(200).json({
      success: true,
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
