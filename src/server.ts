import express, { type Express } from 'express';
import { pino } from 'pino';
import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { userRouter } from '@/api/user/userRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import compressionMiddleware from './common/middleware/compression.middleware';
import corsMiddleware from './common/middleware/cors.middleware';
import helmetMiddleware from './common/middleware/helmet.middleware';
import requestLoggerMiddleware from '@/common/middleware/requestLogger';

const logger = pino({ name: 'server start' });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compressionMiddleware);
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(rateLimiter);

// Request logging
app.use(...requestLoggerMiddleware());

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/users', userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
