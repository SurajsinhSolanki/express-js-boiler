import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { createChildLogger, logSecurityEvent, logPerformance } from '../utils/logger';
import { env } from '@/common/utils/envConfig';

// Request logger instance
const requestLogger = createChildLogger('http-request');

// Custom Morgan tokens
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
    // Assuming you have user info in req.user
    return (req as any).user?.id || 'anonymous';
});

morgan.token('correlation-id', (req: Request) => {
    return (req.headers['x-correlation-id'] as string) || req.id || 'unknown';
});

morgan.token('body', (req: Request) => {
    if (env.isProduction) return '';
    if (!req.body || Object.keys(req.body).length === 0) return '';

    // Create a copy to avoid mutating original
    const sanitizedBody = { ...req.body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization'];
    sensitiveFields.forEach((field) => {
        if (sanitizedBody[field]) {
            sanitizedBody[field] = '[REDACTED]';
        }
    });

    return JSON.stringify(sanitizedBody);
});

morgan.token('query', (req: Request) => {
    if (env.isProduction) return '';
    return req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
});

morgan.token('params', (req: Request) => {
    if (env.isProduction) return '';
    return req.params && Object.keys(req.params).length > 0 ? JSON.stringify(req.params) : '';
});

morgan.token('response-size', (req: Request, res: Response) => {
    return res.get('Content-Length') || '0';
});

morgan.token('request-size', (req: Request) => {
    return req.get('Content-Length') || '0';
});

// Create structured log format
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

// Request logging middleware
const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Generate or use existing request ID
    const existingId = req.headers['x-request-id'] as string;
    const requestId = existingId || randomUUID();
    req.id = requestId;

    // Set response headers
    res.setHeader('X-Request-Id', requestId);

    // Handle correlation ID for distributed tracing
    const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
    res.setHeader('X-Correlation-Id', correlationId);

    // Log request start
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

    // Override res.end to capture final response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log performance if it's slow
        if (duration > 1000) {
            logPerformance(`HTTP ${req.method} ${req.url}`, duration, {
                requestId,
                statusCode: res.statusCode,
                slow: true
            });
        }

        // Log security events
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

        return originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Morgan logger with Pino integration
const morganLogger = morgan(
    (tokens, req: Request, res: Response) => {
        const logData = createLogData(tokens, req, res);

        // Don't return anything - we'll handle logging in the stream
        return JSON.stringify(logData);
    },
    {
        stream: {
            write: (message: string) => {
                try {
                    const logData = JSON.parse(message.trim());
                    const { statusCode, responseTime, method, url } = logData;

                    // Create log message
                    const logMessage = `${method} ${url} - ${statusCode} (${responseTime}ms)`;

                    // Determine log level and method based on status code
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
                    // Fallback logging
                    requestLogger.error({ error: (error as Error).message }, 'Failed to parse Morgan log data');
                }
            }
        },

        // Skip certain requests
        skip: (req: Request) => {
            // Skip health checks and metrics in production
            if (env.isProduction) {
                const skipPaths = ['/health-check', '/health', '/metrics', '/ping', '/favicon.ico'];
                return skipPaths.some((path) => req.url?.startsWith(path));
            }
            return false;
        }
    }
);

// Error logging middleware
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
        body: !env.isProduction ? req.body : undefined,
        query: !env.isProduction ? req.query : undefined,
        params: !env.isProduction ? req.params : undefined
    };

    requestLogger.error(errorData, `Request error: ${error.message}`);

    next(error);
};

// Export middleware array
const requestLoggerMiddleware = () => {
    return [requestIdMiddleware, morganLogger];
};

export { requestLoggerMiddleware as default, errorLogger, requestLogger };
export { createChildLogger } from '../utils/logger';
