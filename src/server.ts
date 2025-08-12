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

app.use(...requestLoggerMiddleware());

app.use('/api/health-check', healthCheckRouter);
app.use('/api/v1/users', userRouter);

app.use(openAPIRouter);

app.use(errorHandler());

export { app, logger };
