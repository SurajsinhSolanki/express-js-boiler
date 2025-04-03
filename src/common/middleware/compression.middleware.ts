import compression from "compression";
import { env } from "@/common/utils/envConfig";
import { NextFunction, Request, Response } from "express";

const compressionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (env.NODE_ENV === "development") {
    return next();
  }

  compression({
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Compression level (0-9)
  })(req, res, next);
};

export default compressionMiddleware;

