import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { createChildLogger, logSecurityEvent, logPerformance } from '../utils/logger';
import { ENV } from '@/common/utils/config';
import { restResponseTimeHistogram } from '../utils/prometheus';

const requestLogger = createChildLogger('http-request');

// Helper to get real IP (same as original morgan token)
const getRealIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Helper to get user ID (same as original)
const getUserId = (req: Request): string => {
  return String(req.user?.userId || 'anonymous');
};

// Helper to get correlation ID (same as original)
const getCorrelationId = (req: Request, requestId: string): string => {
  return (req.headers['x-correlation-id'] as string) || requestId || 'unknown';
};

// Helper for sanitized body (same as original, but lazy-evaluated)
const getSanitizedBody = (req: Request): string => {
  if (ENV.NODE_ENV === 'production') return '';
  if (!req.body || Object.keys(req.body).length === 0) return '';

  if (Object.keys(req.body).length > 100) {
    // Added limit to prevent large allocations
    return '[Large body omitted]';
  }

  const sanitizedBody = { ...req.body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization'];
  sensitiveFields.forEach(field => {
    if (sanitizedBody[field]) {
      sanitizedBody[field] = '[REDACTED]';
    }
  });

  return JSON.stringify(sanitizedBody);
};

// Helpers for query and params (same, but prod-skipped)
const getQuery = (req: Request): string => {
  if (ENV.NODE_ENV === 'production') return '';
  return req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
};

const getParams = (req: Request): string => {
  if (ENV.NODE_ENV === 'production') return '';
  return req.params && Object.keys(req.params).length > 0 ? JSON.stringify(req.params) : '';
};

const createLogData = (req: Request, res: Response, requestId: string, correlationId: string, duration: number) => {
  const { url, method, statusCode, statusMessage } = req;
  const responseTime = duration;
  const userAgent = req.get('User-Agent') || 'unknown';
  const ip = getRealIp(req);
  const userId = getUserId(req);
  const requestSize = parseInt(req.get('Content-Length') || '0');
  const responseSize = parseInt(res.get('Content-Length') || '0');

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
    statusMessage,
    timestamp: new Date().toISOString()
  };

  if (ENV.NODE_ENV !== 'production' || (statusCode ?? 0) >= 400) {
    return {
      ...baseData,
      body: getSanitizedBody(req),
      query: getQuery(req),
      params: getParams(req)
    };
  }
  return baseData;
};

const shouldSkipLog = (req: Request, res: Response): boolean => {
  if (ENV.NODE_ENV === 'production') {
    const skipPaths = ['/health-check', '/health', '/metrics', '/ping', '/favicon.ico'];
    if (skipPaths.some(path => req.url?.startsWith(path))) {
      return true;
    }
    // Sample logging for successful requests (1% sampling to reduce volume under high load)
    if (res.statusCode < 400 && Math.random() > 0.01) {
      return true;
    }
  }
  return false;
};

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();

  const existingId = req.headers['x-request-id'] as string;
  const requestId = existingId || randomUUID();
  req.id = requestId;

  res.setHeader('X-Request-Id', requestId);

  const correlationId = getCorrelationId(req, requestId);
  res.setHeader('X-Correlation-Id', correlationId);

  requestLogger.debug(
    {
      requestId,
      correlationId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    `Incoming request: ${req.method} ${req.url}`
  );

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationNs = endTime - startTime;
    const durationMs = Number(durationNs) / 1e6; // Convert to ms

    if (durationMs > 1000) {
      logPerformance(`HTTP ${req.method} ${req.url}`, durationMs, {
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
      durationMs / 1000
    );

    if (shouldSkipLog(req, res)) {
      return;
    }

    const logData = createLogData(req, res, requestId, correlationId, durationMs);
    const logMessage = `${req.method} ${req.url} - ${res.statusCode} (${durationMs}ms)`;

    if (res.statusCode >= 500) {
      requestLogger.error(logData, logMessage);
    } else if (res.statusCode >= 400) {
      requestLogger.warn(logData, logMessage);
    } else if (res.statusCode >= 300) {
      requestLogger.info(logData, logMessage);
    } else {
      requestLogger.info(logData, logMessage);
    }
  });

  next();
};

export { requestLoggerMiddleware as default };
export { createChildLogger } from '../utils/logger';
