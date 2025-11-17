import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { createChildLogger } from "@/common/utils/logger";
import { StatusCodes } from "@/constants";

const logger = createChildLogger("http-handlers");

export const handleServiceResponse = (
	serviceResponse: ServiceResponse<unknown>,
	response: Response,
): void => {
	response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest =
	(schema: ZodSchema) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Make it async and return Promise<void>
		try {
			await schema.parseAsync({
				// Use parseAsync
				body: req.body,
				query: req.query,
				params: req.params,
			});
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				logger.warn({ error: err }, "Validation error occurred");
				const errorMessages = err.issues.map((issue: any) => ({
					// Extract detailed messages
					field: issue.path.join("."),
					message: issue.message,
				}));
				const serviceResponse = ServiceResponse.failure(
					"Validation failed",
					errorMessages,
					StatusCodes.BAD_REQUEST,
				);
				handleServiceResponse(serviceResponse, res);
				return;
			}
			logger.error({ error: err }, "Unexpected error in validateRequest middleware");
			const serviceResponse = ServiceResponse.failure(
				"Internal Server Error",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
			handleServiceResponse(serviceResponse, res);
			return;
		}
	};
