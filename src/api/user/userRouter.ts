import express, { type Router } from "express";
import { z } from "zod";
import {
	CreateUserSchema,
	GetUserSchema,
	LoginUserSchema,
	UpdateUserSchema,
	UserSchema,
} from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authMiddleware"; // Import auth middleware
import { authorizeRoles } from "@/common/middleware/roleMiddleware"; // Import new role middleware
import { validateRequest } from "@/common/utils/httpHandlers";
import { API_VERSION, buildRoute, ROUTES, UserRole } from "@/constants";
import { userController } from "./userController";

export const userRouter: Router = express.Router();

userRouter.get("/", authenticate, authorizeRoles([UserRole.ADMIN]), userController.getUsers);

// Example route: Get all users (admin only)
userRouter.get(
	"/admin/all",
	authenticate,
	authorizeRoles([UserRole.ADMIN]),
	userController.getUsers,
);

userRouter.get("/:id", authenticate, validateRequest(GetUserSchema), userController.getUser);

userRouter.get("/email/:email", validateRequest(GetUserSchema), userController.findByEmail);

userRouter.get(
	"/phone-number/:phoneNumber",
	validateRequest(GetUserSchema),
	userController.findByPhoneNumber,
);

userRouter.post("/", validateRequest(CreateUserSchema), userController.createUser);

userRouter.put(
	"/:id",
	authenticate,
	authorizeRoles([UserRole.ADMIN, UserRole.USER]),
	validateRequest(UpdateUserSchema),
	userController.updateUser,
);

userRouter.delete(
	"/:id",
	authenticate,
	authorizeRoles([UserRole.ADMIN]),
	validateRequest(GetUserSchema),
	userController.deleteUser,
);

userRouter.post("/login", validateRequest(LoginUserSchema), userController.login);

userRouter.post(
	"/refresh-token",
	validateRequest(z.object({ refreshToken: z.string() })),
	userController.refreshTokens,
);

export const userPaths = {
	[buildRoute(API_VERSION.V1, ROUTES.USERS)]: {
		get: {
			tags: ["User"],
			security: [{ BearerAuth: [] }],
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: z.array(UserSchema),
						},
					},
				},
			},
		},
		post: {
			tags: ["User"],
			security: [],
			requestBody: {
				content: {
					"application/json": {
						schema: CreateUserSchema,
					},
				},
			},
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
			},
		},
	},
	[buildRoute(API_VERSION.V1, ROUTES.USERS) + "/admin/all"]: {
		get: {
			tags: ["User", "Admin"],
			summary: "Get all users (Admin only)",
			security: [{ BearerAuth: [] }],
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: z.array(UserSchema),
						},
					},
				},
			},
		},
	},
	[buildRoute(API_VERSION.V1, ROUTES.USERS) + ROUTES.ID]: {
		get: {
			tags: ["User"],
			security: [{ BearerAuth: [] }],
			parameters: [
				{
					name: "id",
					in: "path" as const,
					required: true,
					schema: { type: "string" as const },
				},
			],
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
			},
		},
		put: {
			tags: ["User"],
			security: [{ BearerAuth: [] }],
			parameters: [
				{
					name: "id",
					in: "path" as const,
					required: true,
					schema: { type: "string" as const },
				},
			],
			requestBody: {
				content: {
					"application/json": {
						schema: UpdateUserSchema,
					},
				},
			},
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
			},
		},
		delete: {
			tags: ["User"],
			security: [{ BearerAuth: [] }],
			parameters: [
				{
					name: "id",
					in: "path" as const,
					required: true,
					schema: { type: "string" as const },
				},
			],
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
			},
		},
	},
	[buildRoute(API_VERSION.V1, ROUTES.USERS) + "/email/{email}"]: {
		get: {
			tags: ["User"],
			security: [{ BearerAuth: [] }],
			parameters: [
				{
					name: "email",
					in: "path" as const,
					required: true,
					schema: { type: "string" as const },
				},
			],
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
			},
		},
	},
	[buildRoute(API_VERSION.V1, ROUTES.USERS) + "/phone-number/{phoneNumber}"]: {
		get: {
			tags: ["User"],
			security: [{ BearerAuth: [] }],
			parameters: [
				{
					name: "phoneNumber",
					in: "path" as const,
					required: true,
					schema: { type: "string" as const },
				},
			],
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
			},
		},
	},
	[buildRoute(API_VERSION.V1, ROUTES.USERS, ROUTES.LOGIN)]: {
		post: {
			tags: ["User"],
			security: [],
			requestBody: {
				content: {
					"application/json": {
						schema: LoginUserSchema,
					},
				},
			},
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
			},
		},
	},
	[buildRoute(API_VERSION.V1, ROUTES.USERS, "/refresh-token")]: {
		post: {
			tags: ["User"],
			security: [],
			requestBody: {
				content: {
					"application/json": {
						schema: z.object({
							refreshToken: z.string(),
						}),
					},
				},
			},
			responses: {
				200: {
					description: "Tokens refreshed successfully",
					content: {
						"application/json": {
							schema: z.object({
								accessToken: z.string(),
								refreshToken: z.string(),
							}),
						},
					},
				},
			},
		},
	},
};
