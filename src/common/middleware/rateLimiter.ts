import { ipKeyGenerator, rateLimit } from "express-rate-limit";

import { ENV } from "@/common/utils/config";

const rateLimiter = rateLimit({
	legacyHeaders: true,
	limit: ENV.COMMON_RATE_LIMIT_MAX_REQUESTS,
	message: "Too many requests, please try again later.",
	standardHeaders: true,
	windowMs: ENV.COMMON_RATE_LIMIT_WINDOW_MS,
});

export default rateLimiter;
