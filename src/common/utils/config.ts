import { z } from 'zod';
import os from 'os';
import 'dotenv/config';

// Enhanced schema with better validation and defaults
const envSchema = z
  .object({
    // Core application config
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    HOST: z.string().default(os.hostname()),
    PORT: z.coerce.number().min(1024).max(65535).default(3000),

    // Service info
    SERVICE_NAME: z.string().default('api-service'),
    SERVICE_VERSION: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/)
      .default('1.0.0'),
    APP_NAME: z.string().default('Express Boilerplate'),

    // Database
    // MYSQL_DATABASE_URL: z.string().url('Invalid database URL'),
    P_SQL_DATABASE_URL: z.string().url('Invalid database URL'),
    // MONGO_DATABASE_URL: z.string().url('Invalid database URL'),

    // Authentication
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    REFRESH_TOKEN_SECRET: z.string().min(32, 'Refresh token secret must be at least 32 characters'),
    JWT_EXPIRY: z
      .string()
      .regex(/^\d+[smhd]$/, 'Invalid JWT expiry format (e.g., 15m, 1h, 7d)')
      .default('15m'),
    REFRESH_TOKEN_EXPIRY: z
      .string()
      .regex(/^\d+[smhd]$/, 'Invalid refresh token expiry format')
      .default('7d'),

    // URLs
    FRONTEND_URL: z.string().url('Invalid frontend URL'),
    SERVER_URL: z.string().url('Invalid server URL'),

    // CORS configuration
    CORS_ORIGIN: z.string().default('*'),
    ALLOWED_ORIGINS: z.string().default('*'),

    // Rate limiting
    COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().min(1).default(1000),
    COMMON_RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .min(1000)
      .default(15 * 60 * 1000), // 15 minutes

    // Clustering
    CLUSTER_ENABLED: z.coerce.boolean().default(false),
    CLUSTER_COUNT: z.coerce.number().min(1).default(os.cpus().length),

    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE: z.coerce.boolean().default(false),

    // Email configuration (conditional based on environment)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().min(1).max(65535).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email('Invalid SMTP from email').optional(),

    // Monitoring
    PROMETHEUS_URL: z.string().url().default('http://localhost:9090')
  })
  .refine(
    data => {
      // Production environment requires complete SMTP configuration
      if (data.NODE_ENV === 'development') {
        const requiredSmtpFields = [data.SMTP_HOST, data.SMTP_PORT, data.SMTP_USER, data.SMTP_PASSWORD, data.SMTP_FROM];

        return requiredSmtpFields.every(field => field !== undefined && field !== '');
      }
      return true;
    },
    {
      message: 'SMTP configuration (HOST, PORT, USER, PASSWORD, FROM) is required in production environment',
      path: ['SMTP_HOST'] // This will highlight SMTP_HOST in error messages
    }
  )
  .refine(
    data => {
      // Validate CORS origins format
      if (data.ALLOWED_ORIGINS !== '*') {
        const origins = data.ALLOWED_ORIGINS.split(',');
        return origins.every(origin => {
          try {
            new URL(origin.trim());
            return true;
          } catch {
            return false;
          }
        });
      }
      return true;
    },
    {
      message: "ALLOWED_ORIGINS must be '*' or comma-separated valid URLs",
      path: ['ALLOWED_ORIGINS']
    }
  );

// Parse environment variables
let ENV: z.infer<typeof envSchema>;

try {
  ENV = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach(err => {
      console.error(`  • ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Export parsed and validated environment
export { ENV };

// Logger configuration
export const loggerConfig = {
  level: ENV.LOG_LEVEL,
  enableFile: ENV.LOG_FILE,
  filename: (dir: string) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    console.log(`${dir}/logs/${ENV.SERVICE_NAME}/${year}-${month}-${day}.log`);
    return `${dir}/logs/${ENV.SERVICE_NAME}/${year}-${month}-${day}.log`;
  },
  service: {
    name: ENV.SERVICE_NAME,
    version: ENV.SERVICE_VERSION
  }
};

// Type exports for better TypeScript support
export type Environment = typeof ENV;

// Development helper - log configuration in development mode
if (ENV.NODE_ENV === 'development') {
  console.log('Environment Configuration Loaded:');
  console.log(`Environment: ${ENV.NODE_ENV}`);
  console.log(`Server: ${ENV.HOST}:${ENV.PORT}`);
  console.log(`Service: ${ENV.SERVICE_NAME}@${ENV.SERVICE_VERSION}`);
  console.log(`Clustering: ${ENV.CLUSTER_ENABLED ? 'Enabled' : 'Disabled'}`);
}
