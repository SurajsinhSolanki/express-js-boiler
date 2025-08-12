import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { createChildLogger, logSecurityEvent, logPerformance } from '../utils/logger';
import { ENV } from '@/common/utils/config';
import { restResponseTimeHistogram } from '../utils/prometheus';

const requestLogger = createChildLogger('http-request');

morgan.token('id', (req: Request) => req.id || 'unknown');
morgan.token('real-ip', (req: Request) => {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
});

morgan.token('user-id', (req: Request) => {
  return String(req.user?.userId || 'anonymous');
});

morgan.token('correlation-id', (req: Request) => {
  return (req.headers['x-correlation-id'] as string) || req.id || 'unknown';
});

morgan.token('body', (req: Request) => {
  if (ENV.NODE_ENV === 'production') return '';
  if (!req.body || Object.keys(req.body).length === 0) return '';

  const sanitizedBody = { ...req.body };

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization'];
  sensitiveFields.forEach(field => {
    if (sanitizedBody[field]) {
      sanitizedBody[field] = '[REDACTED]';
    }
  });

  return JSON.stringify(sanitizedBody);
});

morgan.token('query', (req: Request) => {
  if (ENV.NODE_ENV === 'production') return '';
  return req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
});

morgan.token('params', (req: Request) => {
  if (ENV.NODE_ENV === 'production') return '';
  return req.params && Object.keys(req.params).length > 0 ? JSON.stringify(req.params) : '';
});

morgan.token('response-size', (req: Request, res: Response) => {
  return res.get('Content-Length') || '0';
});

morgan.token('request-size', (req: Request) => {
  return req.get('Content-Length') || '0';
});

const createLogData = (tokens: any, req: Request, res: Response) => {
  const responseTime = parseFloat(tokens['response-time'](req, res));
  const statusCode = parseInt(tokens.status(req, res));
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const userAgent = tokens['user-agent'](req, res);
  const ip = tokens['real-ip'](req, res);
  const userId = tokens['user-id'](req, res);
  const requestId = tokens.id(req, res);
  const correlationId = tokens['correlation-id'](req, res);
  const requestSize = parseInt(tokens['request-size'](req, res));
  const responseSize = parseInt(tokens['response-size'](req, res));

  const baseData = {
    requestId,
    correlationId,
    method,
    url,
    statusCode,
    responseTime,
    ip,
    userAgent,
    userId,
    requestSize,
    responseSize,
    timestamp: new Date().toISOString()
  };
  return baseData;
};

const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  const existingId = req.headers['x-request-id'] as string;
  const requestId = existingId || randomUUID();
  req.id = requestId;

  res.setHeader('X-Request-Id', requestId);

  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
  res.setHeader('X-Correlation-Id', correlationId);

  requestLogger.debug(
    {
      requestId,
      correlationId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      startTime
    },
    `Incoming request: ${req.method} ${req.url}`
  );

  const originalEnd = res.end;
  res.end = function (this: any, ...args: any[]) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration > 1000) {
      logPerformance(`HTTP ${req.method} ${req.url}`, duration, {
        requestId,
        statusCode: res.statusCode,
        slow: true
      });
    }

    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent('Authentication/Authorization failure', {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent')
      });
    }

    restResponseTimeHistogram.observe(
      {
        method: req.method,
        route: req.route?.path || req.url,
        status_code: res.statusCode
      },
      duration / 1000
    );

    return originalEnd.apply(this, args as any);
  } as typeof res.end;

  next();
};

const morganLogger = morgan(
  (tokens, req: Request, res: Response) => {
    const logData = createLogData(tokens, req, res);

    return JSON.stringify(logData);
  },
  {
    stream: {
      write: (message: string) => {
        try {
          const logData = JSON.parse(message.trim());
          const { statusCode, responseTime, method, url } = logData;

          const logMessage = `${method} ${url} - ${statusCode} (${responseTime}ms)`;

          if (statusCode >= 500) {
            requestLogger.error(logData, logMessage);
          } else if (statusCode >= 400) {
            requestLogger.warn(logData, logMessage);
          } else if (statusCode >= 300) {
            requestLogger.info(logData, logMessage);
          } else {
            requestLogger.info(logData, logMessage);
          }
        } catch (error) {
          requestLogger.error({ error: (error as Error).message }, 'Failed to parse Morgan log data');
        }
      }
    },

    skip: (req: Request) => {
      if (ENV.NODE_ENV === 'production') {
        const skipPaths = ['/health-check', '/health', '/metrics', '/ping', '/favicon.ico'];
        return skipPaths.some(path => req.url?.startsWith(path));
      }
      return false;
    }
  }
);

const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorData = {
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    body: ENV.NODE_ENV !== 'production' ? req.body : undefined,
    query: ENV.NODE_ENV !== 'production' ? req.query : undefined,
    params: ENV.NODE_ENV !== 'production' ? req.params : undefined
  };

  requestLogger.error(errorData, `Request error: ${error.message}`);

  next(error);
};

const requestLoggerMiddleware = () => {
  return [requestIdMiddleware, morganLogger];
};

export { requestLoggerMiddleware as default, errorLogger, requestLogger };
export { createChildLogger } from '../utils/logger';
