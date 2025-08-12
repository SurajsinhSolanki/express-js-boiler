import cors from 'cors';
import { ENV } from '@/common/utils/config';
import { Request, Response, NextFunction } from 'express';

const allowedOrigins = ENV.ALLOWED_ORIGINS?.split(',') || [];

const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (ENV.NODE_ENV === 'development') {
    return next();
  }

  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400
  })(req, res, next);
};

export default corsMiddleware;
