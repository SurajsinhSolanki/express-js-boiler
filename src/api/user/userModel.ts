import "zod-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	id: z.number(),
	email: z.string().email().nullable().optional(),
	phoneNumber: z.string().nullable().optional(),
	password: z.string(),
	isVerified: z.boolean().default(false),
	isAdmin: z.boolean().default(false),
	emailVerified: z.boolean().default(false),
	phoneVerified: z.boolean().default(false),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable().optional(),
});

export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

export const CreateUserSchema = z
	.object({
		email: z.string().email("Invalid email address").optional(),
		phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
		password: z.string().min(8, "Password must be at least 8 characters long"),
		isAdmin: z.boolean().default(false).optional(),
	})
	.refine((data) => data.email || data.phoneNumber, {
		message: "Either email or phone number must be provided",
		path: ["email", "phoneNumber"],
	});

export const UpdateUserSchema = z
	.object({
		name: z.string().optional(),
		address: z.string().optional(),
		isVerified: z.boolean().optional(),
		isAdmin: z.boolean().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
		path: ["body"],
	});

export const RequestEmailChangeSchema = z.object({
	newEmail: z.string().email("Invalid email address").min(1, "New email is required"),
});

export const VerifyEmailChangeSchema = z.object({
	token: z.string().min(1, "Verification token is required"),
});

export type CreateUserBody = z.infer<typeof CreateUserSchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserSchema>;

export const LoginUserSchema = z
	.object({
		email: z.string().email("Invalid email address").optional(),
		phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
		password: z.string().min(1, "Password is required"),
	})
	.refine((data) => data.email || data.phoneNumber, {
		message: "Either email or phone number must be provided for login",
		path: ["email", "phoneNumber"],
	});

export type LoginUserBody = z.infer<typeof LoginUserSchema>;
