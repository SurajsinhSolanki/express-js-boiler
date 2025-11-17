import compression from "compression";
import type { NextFunction, Request, Response } from "express";
import { ENV } from "@/common/utils/config";

const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (ENV.NODE_ENV === "development") {
		return next();
	}

	compression({
		threshold: 1024,
		filter: (filterReq, filterRes) => {
			if (filterReq.headers["x-no-compression"]) {
				return false;
			}
			return compression.filter(filterReq, filterRes);
		},
		level: 6,
	})(req, res, next);
};

export default compressionMiddleware;
