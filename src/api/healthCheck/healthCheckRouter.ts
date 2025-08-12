import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Request, type Response, type Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { API_ROUTES } from '@/common/utils/apiRoutes';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

export const healthCheckRegistry = new OpenAPIRegistry();
export const healthCheckRouter: Router = express.Router();

healthCheckRegistry.registerPath({
  method: 'get',
  path: API_ROUTES.HEALTH_CHECK,
  tags: ['Health Check'],
  security: [],
  responses: createApiResponse(z.null(), 'Success')
});

healthCheckRouter.get('/', (req: Request, res: Response) => {
  const serviceResponse = ServiceResponse.success(req.t('welcome'), {
    // Use i18n translation
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    language: req.language // Add current language to response
  });

  return handleServiceResponse(serviceResponse, res);
});
