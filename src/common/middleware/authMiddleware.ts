import type { NextFunction, Request, Response } from "express";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { verifyAccessToken } from "@/common/utils/jwt";
import { StatusCodes } from "@/constants";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		const serviceResponse = ServiceResponse.failure(
			"No token provided or invalid format",
			null,
			StatusCodes.UNAUTHORIZED,
		);
		res.status(StatusCodes.UNAUTHORIZED).json(serviceResponse);
		return;
	}

	const token = authHeader.split(" ")[1];
	const decoded = verifyAccessToken(token);

	if (!decoded) {
		const serviceResponse = ServiceResponse.failure(
			"Invalid or expired token",
			null,
			StatusCodes.FORBIDDEN,
		);
		res.status(StatusCodes.FORBIDDEN).json(serviceResponse);
		return;
	}

	req.user = decoded;
	next();
};

export const authorize =
	(allowedRoles: ("admin" | "user")[]) =>
	(req: Request, res: Response, next: NextFunction): void => {
		// Change return type to void
		if (!req.user) {
			const serviceResponse = ServiceResponse.failure(
				"Authentication required",
				null,
				StatusCodes.UNAUTHORIZED,
			);
			res.status(StatusCodes.UNAUTHORIZED).json(serviceResponse);
			return;
		}

		const userRole = req.user.role;

		if (!allowedRoles.includes(userRole)) {
			const serviceResponse = ServiceResponse.failure(
				"Forbidden: Insufficient permissions",
				null,
				StatusCodes.FORBIDDEN,
			);
			res.status(StatusCodes.FORBIDDEN).json(serviceResponse);
			return;
		}

		next();
	};
