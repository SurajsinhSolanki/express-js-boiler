import { StatusCodes } from '@/common/utils/statusCodes';
import type { z } from 'zod';

import { ServiceResponseSchema } from '@/common/models/serviceResponse';

export function createApiResponse(schema: z.ZodTypeAny, description: string, statusCode = StatusCodes.OK) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(schema)
        }
      }
    }
  };
}
