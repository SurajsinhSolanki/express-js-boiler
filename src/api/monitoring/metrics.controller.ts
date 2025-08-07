import { Request, Response, Router } from 'express';
import { API_ROUTES } from '@/common/utils/apiRoutes';
import { metricsService } from './metrics.service';

const router = Router();

router.get(API_ROUTES.MONITORING_METRICS, async (_req: Request, res: Response) => {
  res.set('Content-Type', metricsService.getContentType());
  const metrics = await metricsService.getMetrics();
  res.send(metrics);
});

export default router;
