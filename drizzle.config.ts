import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	schema: "./src/drizzle/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.P_SQL_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/boiler",
	},
	verbose: true,
	strict: true,
});
