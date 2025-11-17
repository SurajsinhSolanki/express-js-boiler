import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import type { ServiceResponse } from "@/common/models/serviceResponse";

export const handleServiceResponse = (
	serviceResponse: ServiceResponse<unknown>,
	response: Response,
): void => {
	response.status(serviceResponse.statusCode).send(serviceResponse);
};

type RequestPart = "body" | "query" | "params";

export const validateRequest =
	(schema: ZodSchema, target: RequestPart = "body") =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Validate the selected part
			await schema.parseAsync(req[target]);

			next();
		} catch (err) {
			if (err instanceof ZodError) {
				const errors = err.issues.map((issue) => ({
					field: issue.path.join("."),
					message: issue.message,
				}));

				return res.status(400).json({
					success: false,
					message: "Validation failed",
					responseObject: errors,
					statusCode: 400,
				});
			}

			return res.status(500).json({
				success: false,
				message: "Internal Server Error",
				responseObject: null,
				statusCode: 500,
			});
		}
	};
