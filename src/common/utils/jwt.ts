import jwt, { type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import type { User } from "@/api/user/userModel";
import { pblKey, pvtKey } from "@/common/config/keys";
import { ENV } from "@/common/utils/config";

export interface JwtPayload {
	userId: number;
	email?: string;
	phoneNumber?: string;
	isAdmin: boolean;
	role: "admin" | "user";
}

/**
 * Generates an access token.
 * @param payload The data to include in the token.
 * @returns The generated access token.
 */
export const generateAccessToken = (payload: JwtPayload): string => {
	const options: SignOptions = {
		algorithm: "RS256",
		expiresIn: ENV.JWT_EXPIRY as StringValue | number,
		issuer: ENV.JWT_ISSUER,
		audience: ENV.JWT_AUDIENCE,
	};
	return jwt.sign(payload, pvtKey, options);
};

/**
 * Generates a refresh token.
 * @param payload The data to include in the token.
 * @returns The generated refresh token.
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
	const options: SignOptions = {
		algorithm: "RS256",
		expiresIn: ENV.REFRESH_TOKEN_EXPIRY as StringValue | number,
	};
	return jwt.sign(payload, pvtKey, options);
};

/**
 * Verifies a refresh token.
 * @param token The token to verify.
 * @returns The decoded payload if verification is successful, null otherwise.
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
	try {
		return jwt.verify(token, pblKey) as JwtPayload;
	} catch {
		return null;
	}
};

/**
 * Verifies an access token.
 * @param token The token to verify.
 * @returns The decoded payload if verification is successful, null otherwise.
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
	try {
		return jwt.verify(token, pblKey) as JwtPayload;
	} catch {
		return null;
	}
};

/**
 * Extracts the JWT payload from a User object.
 * @param user The user object.
 * @returns The JWT payload.
 */
export const extractJwtPayload = (user: User): JwtPayload => {
	return {
		userId: user.id,
		email: user.email || undefined,
		phoneNumber: user.phoneNumber || undefined,
		isAdmin: user.isAdmin,
		role: user.isAdmin ? "admin" : "user",
	};
};
