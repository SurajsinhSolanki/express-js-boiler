import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { ENV } from '../utils/config';
import { databaseResponseTimeHistogram } from '../utils/prometheus';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger('database-config');

const prisma = new PrismaClient({
  log: ENV.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
  datasources: {
    db: {
      url: ENV.P_SQL_DATABASE_URL
    }
  }
});

prisma.$use(async (params: any, next: any) => {
  const startTime = Date.now();
  const result = await next(params);
  const endTime = Date.now();
  const duration = endTime - startTime;

  databaseResponseTimeHistogram.observe(
    {
      operation: params.model ? `${params.model}.${params.action}` : params.action,
      success: result !== null && result !== undefined ? 'true' : 'false'
    },
    duration / 1000
  );

  return result;
});

const connectMongoose = async () => {
  if (!ENV.MONGO_DATABASE_URL) {
    logger.warn('MongoDB connection string not provided. Skipping MongoDB connection.');
    return;
  }

  try {
    await mongoose.connect(ENV.MONGO_DATABASE_URL);
    logger.info('MongoDB connected successfully!');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1); // Exit process if MongoDB connection fails
  }
};

const disconnectMongoose = async () => {
  if (mongoose.connection.readyState === 1) {
    // 1 means connected
    await mongoose.disconnect();
    logger.info('MongoDB disconnected.');
  }
};

const handleShutdown = async () => {
  logger.info('Shutting down database connections...');
  await prisma.$disconnect();
  await disconnectMongoose();
  logger.info('All database connections shut down.');
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

export { prisma, connectMongoose, disconnectMongoose };
