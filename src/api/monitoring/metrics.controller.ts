import { type Request, type Response, Router } from "express";
import { ROUTES } from "@/constants";
import { metricsService } from "./metrics.service";

const router = Router();

router.get(ROUTES.METRICS, async (_req: Request, res: Response) => {
	res.set("Content-Type", metricsService.getContentType());
	const metrics = await metricsService.getMetrics();
	res.send(metrics);
});

export default router;
