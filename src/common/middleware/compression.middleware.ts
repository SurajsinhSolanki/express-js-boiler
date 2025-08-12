import compression from 'compression';
import { ENV } from '@/common/utils/config';
import { NextFunction, Request, Response } from 'express';

const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (ENV.NODE_ENV === 'development') {
    return next();
  }

  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6
  })(req, res, next);
};

export default compressionMiddleware;
