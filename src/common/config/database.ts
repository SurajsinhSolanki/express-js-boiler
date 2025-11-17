import { drizzle } from "drizzle-orm/node-postgres";
import mongoose from "mongoose";
import { Pool } from "pg";
import * as schema from "../../drizzle/schema";
import { ENV } from "../utils/config";
import { createChildLogger } from "../utils/logger";

const logger = createChildLogger("database-config");

// Create postgres client
const pool = new Pool({
	connectionString: ENV.P_SQL_DATABASE_URL,
});

// Create Drizzle instance
const db = drizzle(pool, { schema, logger: ENV.NODE_ENV === "development" });

const connectMongoose = async () => {
	if (!ENV.MONGO_DATABASE_URL) {
		logger.warn("MongoDB connection string not provided. Skipping MongoDB connection.");
		return;
	}

	try {
		await mongoose.connect(ENV.MONGO_DATABASE_URL);
		logger.info("MongoDB connected successfully!");
	} catch (error) {
		logger.error({ error }, "MongoDB connection error");
		process.exit(1); // Exit process if MongoDB connection fails
	}
};

const disconnectMongoose = async () => {
	if (mongoose.connection.readyState === 1) {
		// 1 means connected
		await mongoose.disconnect();
		logger.info("MongoDB disconnected.");
	}
};

const handleShutdown = async () => {
	logger.info("Shutting down database connections...");
	await pool.end();
	await disconnectMongoose();
	logger.info("All database connections shut down.");
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

export { db, connectMongoose, disconnectMongoose };
