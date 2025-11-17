import type { NextFunction, Request, Response } from "express";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { createChildLogger } from "@/common/utils/logger";
import { StatusCodes, UserRole } from "@/constants";

const logger = createChildLogger("role-middleware");

export const authorizeRoles = (allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			logger.warn(
				"Authorization failed: No user found in request (authMiddleware likely missing or failed).",
			);
			res
				.status(StatusCodes.UNAUTHORIZED)
				.json(
					ServiceResponse.failure(
						"Unauthorized: Authentication required.",
						null,
						StatusCodes.UNAUTHORIZED,
					),
				);
			return; // Explicitly return void
		}

		// Check if the user's role is included in the allowedRoles
		const userHasRequiredRole = allowedRoles.some((role) => {
			// If the allowed role is ADMIN, check if the user is an admin
			if (role === UserRole.ADMIN && req.user?.isAdmin) {
				return true;
			}
			// If the allowed role is USER, and the user has any role (meaning authenticated), grant access
			// This assumes 'USER' is the base role for any authenticated user.
			if (
				role === UserRole.USER &&
				(req.user?.role === UserRole.USER || req.user?.role === UserRole.ADMIN)
			) {
				return true;
			}
			return false;
		});

		if (userHasRequiredRole) {
			return next(); // Explicitly return next()
		} else {
			logger.warn(
				`Authorization failed for user ${req.user.userId}: Insufficient role. Required: ${allowedRoles.join(", ")}`,
			);
			res
				.status(StatusCodes.FORBIDDEN)
				.json(
					ServiceResponse.failure(
						"Forbidden: Insufficient permissions.",
						null,
						StatusCodes.FORBIDDEN,
					),
				);
			return; // Explicitly return void
		}
	};
};
