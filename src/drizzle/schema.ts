import { boolean, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const verificationTypeEnum = z.enum([
	"EMAIL_VERIFICATION",
	"PHONE_VERIFICATION",
	"REFRESH_TOKEN",
	"CHANGE_EMAIL",
]);
export type VerificationType = z.infer<typeof verificationTypeEnum>;

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	email: varchar("email", { length: 255 }).unique(),
	phoneNumber: varchar("phone_number", { length: 20 }).unique(),
	password: varchar("password", { length: 255 }).notNull(),
	isVerified: boolean("is_verified").default(false),
	isAdmin: boolean("is_admin").default(false),
	emailVerified: boolean("email_verified").default(false),
	phoneVerified: boolean("phone_verified").default(false),
	deletedAt: timestamp("deleted_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const userVerifications = pgTable("user_verifications", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
	verificationType: varchar("verification_type", { length: 50 }).notNull(),
	token: varchar("token", { length: 255 }).notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	isUsed: boolean("is_used").default(false),
	createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertUserVerificationSchema = createInsertSchema(userVerifications);
export const selectUserVerificationSchema = createSelectSchema(userVerifications);
