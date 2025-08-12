import { Request, Response, NextFunction } from 'express';
import { API_ROUTES } from '@/common/utils/apiRoutes';
import { metricsService } from './metrics.service';

let lastStatsUpdate = Date.now();

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationInSeconds = seconds + nanoseconds / 1e9;

    const route = req.route?.path || req.path || 'unknown';

    if (route.startsWith(API_ROUTES.MONITORING_METRICS)) return;

    metricsService.recordHttpRequest(req.method, route, res.statusCode, durationInSeconds);

    if (res.statusCode >= 400) {
      metricsService.recordHttpError(req.method, route, res.statusCode);
    }

    const now = Date.now();
    if (now - lastStatsUpdate > 15000) {
      metricsService.updateSystemMetrics();
      lastStatsUpdate = now;
    }
  });

  next();
};
