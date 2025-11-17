import { randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { DateTime } from "luxon";
import type { User } from "@/api/user/userModel";
import { db } from "@/common/config/database";
import { users, userVerifications, type VerificationType } from "@/drizzle/schema";

export class UserRepository {
	async findAllAsync(): Promise<User[]> {
		const result = await db.select().from(users).where(isNull(users.deletedAt));
		return result as User[];
	}

	async findByIdAsync(id: number): Promise<User | null> {
		const result = await db
			.select()
			.from(users)
			.where(and(eq(users.id, id), isNull(users.deletedAt)))
			.limit(1);
		return (result[0] as User) || null;
	}

	async findByEmailAsync(email: string): Promise<User | null> {
		const result = await db
			.select()
			.from(users)
			.where(and(eq(users.email, email), isNull(users.deletedAt)))
			.limit(1);
		return (result[0] as User) || null;
	}

	async findByPhoneNumberAsync(phoneNumber: string): Promise<User | null> {
		const result = await db
			.select()
			.from(users)
			.where(and(eq(users.phoneNumber, phoneNumber), isNull(users.deletedAt)))
			.limit(1);
		return (result[0] as User) || null;
	}

	async createAsync(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
		const result = await db.insert(users).values(user).returning();
		return result[0] as User;
	}

	async updateAsync(id: number, user: Partial<User>): Promise<User> {
		const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
		return result[0] as User;
	}

	async deleteAsync(id: number): Promise<User> {
		const result = await db.delete(users).where(eq(users.id, id)).returning();
		return result[0] as User;
	}

	async createVerificationTokenAsync(
		userId: number,
		type: VerificationType,
	): Promise<{ id: number; token: string; expiresAt: Date } | null> {
		const token = randomBytes(32).toString("hex");
		const expiresAt = DateTime.now().plus({ minutes: 60 }).toJSDate(); // Default 60 minutes for verification tokens

		const result = await db
			.insert(userVerifications)
			.values({
				userId,
				verificationType: type,
				token,
				expiresAt,
			})
			.returning({
				id: userVerifications.id,
				token: userVerifications.token,
				expiresAt: userVerifications.expiresAt,
			});
		return result[0] || null;
	}

	async createRefreshTokenAsync(
		userId: number,
		token: string,
		expiresAt: Date,
	): Promise<{ id: number; token: string; expiresAt: Date; isUsed: boolean | null } | null> {
		const result = await db
			.insert(userVerifications)
			.values({
				userId,
				verificationType: "REFRESH_TOKEN",
				token,
				expiresAt,
				isUsed: false, // Initially not used/revoked
			})
			.returning({
				id: userVerifications.id,
				token: userVerifications.token,
				expiresAt: userVerifications.expiresAt,
				isUsed: userVerifications.isUsed,
			});
		return result[0] || null;
	}

	async findVerificationTokenAsync(
		token: string,
		type: VerificationType,
	): Promise<{
		id: number;
		userId: number;
		token: string;
		expiresAt: Date;
		isUsed: boolean;
	} | null> {
		const result = await db
			.select()
			.from(userVerifications)
			.where(
				and(
					eq(userVerifications.token, token),
					eq(userVerifications.verificationType, type),
					eq(userVerifications.isUsed, false),
				),
			)
			.limit(1);
		return (result[0] as any) || null;
	}

	async findRefreshTokenAsync(token: string): Promise<{
		id: number;
		userId: number;
		token: string;
		expiresAt: Date;
		isUsed: boolean;
	} | null> {
		const result = await db
			.select()
			.from(userVerifications)
			.where(
				and(
					eq(userVerifications.token, token),
					eq(userVerifications.verificationType, "REFRESH_TOKEN"),
					eq(userVerifications.isUsed, false),
				),
			)
			.limit(1);
		return (result[0] as any) || null;
	}

	async markVerificationTokenAsUsedAsync(id: number): Promise<void> {
		await db.update(userVerifications).set({ isUsed: true }).where(eq(userVerifications.id, id));
	}
}
