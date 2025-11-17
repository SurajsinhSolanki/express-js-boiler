import { createDocument } from "zod-openapi";

import { healthCheckPaths } from "@/api/healthCheck/healthCheckRouter";
import { uploadPaths } from "@/api/upload/uploadRouter";
import { userPaths } from "@/api/user/userRouter";

export function generateOpenAPIDocument() {
	return createDocument({
		openapi: "3.1.0",
		info: {
			version: "1.0.0",
			title: "Swagger API",
		},
		servers: [{ url: "/api" }],
		security: [{ BearerAuth: [] }],
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		paths: {
			...healthCheckPaths,
			...userPaths,
			...uploadPaths,
		},
	});
}
