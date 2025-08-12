import 'express';
import { JwtPayload } from '../../common/utils/jwt';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: JwtPayload;
    }
  }
}
