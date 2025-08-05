import pino from 'pino';
import { ENV, loggerConfig } from '@/common/utils/config';
import { cwd } from 'node:process';

// Define log levels
const logLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10
};

// Base logger configuration
const baseConfig: pino.LoggerOptions = {
  level: ENV.LOG_LEVEL || (ENV.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Custom levels if needed
  customLevels: logLevels,

  // Redact sensitive information
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.secret',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key'
    ],
    remove: true
  },

  // Format timestamp
  timestamp: pino.stdTimeFunctions.isoTime,

  // Serializers for common objects
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  }
};

// Production configuration - optimized for performance and structured logs
const productionConfig: pino.LoggerOptions = {
  ...baseConfig,

  // Use destinations for better performance
  ...(loggerConfig.enableFile && {
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: { destination: loggerConfig.filename(cwd()), mkdir: true }
        },
        {
          target: 'pino-pretty',
          options: { destination: 1 } // stdout
        }
      ]
    }
  })
};

// Development configuration - pretty printed for readability
const developmentConfig: pino.LoggerOptions = {
  ...baseConfig,

  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname,service,version,environment',
      messageFormat: '{service}[{pid}]: {msg}',
      singleLine: false,
      hideObject: false
    }
  }
};

// Create logger instance
const logger = pino(ENV.NODE_ENV === 'production' ? productionConfig : developmentConfig);

// Child logger factory for different modules
export const createChildLogger = (module: string, context?: Record<string, any>) => {
  return logger.child({ module, ...context });
};

// Typed logger interface for better development experience
export interface Logger {
  trace: (obj: any, msg?: string) => void;
  debug: (obj: any, msg?: string) => void;
  info: (obj: any, msg?: string) => void;
  warn: (obj: any, msg?: string) => void;
  error: (obj: any, msg?: string) => void;
  fatal: (obj: any, msg?: string) => void;
  child: (bindings: Record<string, any>) => Logger;
}

// Error logging helper
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(
    {
      err: error,
      stack: error.stack,
      ...context
    },
    error.message
  );
};

// Performance logging helper
export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.info(
    {
      operation,
      duration,
      performance: true,
      ...context
    },
    `Operation ${operation} completed in ${duration}ms`
  );
};

// Business logic logging helper
export const logBusinessEvent = (event: string, data?: Record<string, any>) => {
  logger.info(
    {
      businessEvent: event,
      eventData: data,
      timestamp: new Date().toISOString()
    },
    `Business event: ${event}`
  );
};

// Security logging helper
export const logSecurityEvent = (event: string, context?: Record<string, any>) => {
  logger.warn(
    {
      securityEvent: event,
      ...context,
      timestamp: new Date().toISOString()
    },
    `Security event: ${event}`
  );
};

// Audit logging helper
export const logAudit = (action: string, userId?: string, resource?: string, context?: Record<string, any>) => {
  logger.info(
    {
      audit: true,
      action,
      userId,
      resource,
      ...context,
      timestamp: new Date().toISOString()
    },
    `Audit: ${action} by ${userId || 'anonymous'} on ${resource || 'unknown'}`
  );
};

export default logger;
