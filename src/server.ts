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
import { metricsMiddleware } from './api/monitoring/metrics.middleware';
import metricsRouter from './api/monitoring/metrics.controller';
import i18nMiddleware from './common/utils/i18'; // Import i18n middleware
import { uploadRouter } from '@/api/upload/uploadRouter'; // Import upload router

const logger = pino({ name: 'server start' });
const app: Express = express();

app.use(metricsMiddleware);
app.use('/api', metricsRouter);

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compressionMiddleware);
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(rateLimiter);

app.use(i18nMiddleware); // Use i18n middleware

app.use(...requestLoggerMiddleware());

app.use('/api/health-check', healthCheckRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/upload', uploadRouter); // Add upload router

app.use(openAPIRouter);

app.use(errorHandler());

import { createServer } from 'http'; // Import http server
const httpServer = createServer(app); // Create HTTP server from Express app

export { app, logger, httpServer }; // Export httpServer
