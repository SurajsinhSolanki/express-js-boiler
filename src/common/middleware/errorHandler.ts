import type { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from '@/common/utils/statusCodes';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { createChildLogger } from '@/common/utils/logger';

const logger = createChildLogger('error-handler');

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND).json(ServiceResponse.failure('Resource not found', null, StatusCodes.NOT_FOUND));
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next): void => {
  logger.error({ err }, 'Error occurred');

  if (err.name === 'ValidationError') {
    res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure(err.message, err.errors, StatusCodes.BAD_REQUEST));
  }

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json(ServiceResponse.failure(err.message || 'Internal Server Error', null, statusCode));
};

export default () => [unexpectedRequest, errorHandler];
