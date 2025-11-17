import type { z } from "zod";
import { ServiceResponseSchema } from "@/common/models/serviceResponse";
import { StatusCodes } from "@/constants";

export function createApiResponse(
	schema: z.ZodTypeAny,
	description: string,
	statusCode = StatusCodes.OK,
) {
	return {
		[statusCode]: {
			description,
			content: {
				"application/json": {
					schema: ServiceResponseSchema(schema),
				},
			},
		},
	};
}
