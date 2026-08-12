import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// Full Health Report (/health)
router.get('/health', async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  let dbConnected = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (e) {
    dbConnected = false;
  }

  const isHealthy = dbConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
      memory: {
        rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
        heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      },
    },
  });
});

// Liveness Probe (/health/liveness)
router.get('/health/liveness', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ALIVE', timestamp: new Date().toISOString() });
});

// Readiness Probe (/health/readiness)
router.get('/health/readiness', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'READY', database: 'HEALTHY', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ status: 'NOT_READY', database: 'UNHEALTHY', timestamp: new Date().toISOString() });
  }
});

export default router;
