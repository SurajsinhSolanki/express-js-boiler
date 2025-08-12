import pino from 'pino';
import { ENV, loggerConfig } from '@/common/utils/config';
import { getFilename } from './filenameUtils';

const logLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10
};

const baseConfig: pino.LoggerOptions = {
  level: ENV.LOG_LEVEL || (ENV.NODE_ENV === 'production' ? 'info' : 'debug'),

  customLevels: logLevels,

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

  timestamp: pino.stdTimeFunctions.isoTime,

  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  }
};

const productionConfig: pino.LoggerOptions = {
  ...baseConfig,

  ...(loggerConfig.enableFile && {
    transport: {
      targets: [
        {
          target: 'pino/file',
          level: 'error',
          options: {
            destination: getFilename({ subDir: '/logs', dateFormat: 'yyyy-MM-dd', suffix: 'error', extension: 'log' }),
            mkdir: true
          }
        },
        {
          target: 'pino-pretty',
          options: { destination: 1 }
        }
      ]
    }
  })
};

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

const logger = pino(ENV.NODE_ENV === 'production' ? productionConfig : developmentConfig);

export const createChildLogger = (module: string, context?: Record<string, any>) => {
  return logger.child({ module, ...context });
};

export interface Logger {
  trace: (obj: any, msg?: string) => void;
  debug: (obj: any, msg?: string) => void;
  info: (obj: any, msg?: string) => void;
  warn: (obj: any, msg?: string) => void;
  error: (obj: any, msg?: string) => void;
  fatal: (obj: any, msg?: string) => void;
  child: (bindings: Record<string, any>) => Logger;
}

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
