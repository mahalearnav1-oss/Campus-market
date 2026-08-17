import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiting';
import routes from './routes';

import path from 'path';

export const createApp = (): Application => {
  const app = express();

  // Security Headers configuration via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'http:', 'blob:'],
          connectSrc: ["'self'", 'ws://localhost:5000', 'wss://localhost:5000', 'https://api.razorpay.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          frameSrc: ["'self'", 'https://api.razorpay.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    })
  );

  // CORS Configuration
  const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (config.env === 'development' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestLogger);

  // Static Uploads Serving
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/api/v1/uploads', express.static(uploadsPath));
  app.use('/uploads', express.static(uploadsPath));

  // Global API Rate Limiter
  app.use('/api/v1', apiLimiter);

  // API v1 Routes Namespace
  app.use('/api/v1', routes);

  // Error Handler
  app.use(errorHandler);

  return app;
};
