import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { ROUTES } from "@/constants";

export const healthCheckRouter: Router = express.Router();

export const healthCheckPaths = {
	[ROUTES.HEALTH_CHECK]: {
		get: {
			tags: ["Health Check"],
			security: [],
			responses: createApiResponse(z.null(), "Success"),
		},
	},
};

healthCheckRouter.get("/", (req: Request, res: Response) => {
	const serviceResponse = ServiceResponse.success(req.t("welcome"), {
		// Use i18n translation
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		language: req.language, // Add current language to response
	});

	return handleServiceResponse(serviceResponse, res);
});
