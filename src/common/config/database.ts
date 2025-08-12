import { PrismaClient } from '@prisma/client';
import { ENV } from '../utils/config';
import { databaseResponseTimeHistogram } from '../utils/prometheus';

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

const handleShutdown = async () => {
  console.log('Shutting down database connection');
  await prisma.$disconnect();
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

export default prisma;
