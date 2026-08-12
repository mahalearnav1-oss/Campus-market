import { Request, Response } from 'express';
import { config } from '../config';

export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'CampusMarket API',
      version: '1.0.0',
      environment: config.env,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
