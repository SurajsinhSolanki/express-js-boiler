import type { ErrorRequestHandler, RequestHandler } from "express";
import ErrorLog from "@/common/models/errorLogModel";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { ENV } from "@/common/utils/config";
import { sendErrorEmail } from "@/common/utils/emailService";
import { createChildLogger } from "@/common/utils/logger";
import { sendErrorToSlack } from "@/common/utils/slackLogger";
import { StatusCodes } from "@/constants";

const logger = createChildLogger("error-handler");

const unexpectedRequest: RequestHandler = (_req, res) => {
	res
		.status(StatusCodes.NOT_FOUND)
		.json(ServiceResponse.failure("Resource not found", null, StatusCodes.NOT_FOUND));
};

const errorHandler: ErrorRequestHandler = (err, req, res, _next): void => {
	logger.error({ err }, "Error occurred");

	if (ENV.NODE_ENV === "production" && ENV.MONGO_LOG_ENABLED) {
		const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
		const errorLog = new ErrorLog({
			message: err.message,
			stack: err.stack,
			level: "error",
			timestamp: new Date(),
			environment: ENV.NODE_ENV,
			statusCode: statusCode,
			requestUrl: req.originalUrl,
			requestMethod: req.method,
			ipAddress: req.ip,
			// userId: req.user?._id, // Uncomment if you have user authentication and want to log user ID
			additionalInfo: {
				// Add any other relevant request/error details here
				headers: req.headers,
				body: req.body,
				params: req.params,
				query: req.query,
			},
		});

		errorLog.save().catch((mongoErr) => {
			logger.error({ mongoErr }, "Failed to save error log to MongoDB");
		});

		// Send error email notification if DEV_EMAIL is configured
		if (ENV.DEV_EMAIL) {
			sendErrorEmail(err).catch((emailSendError) => {
				logger.error({ emailSendError }, "Failed to send error email notification.");
			});
		}

		// Send error to Slack if SLACK_LOG_ENABLED is configured
		if (ENV.SLACK_LOG_ENABLED) {
			sendErrorToSlack(err.message, {
				stack: err.stack,
				environment: ENV.NODE_ENV,
				timestamp: new Date().toISOString(),
				requestUrl: req.originalUrl,
				requestMethod: req.method,
				ipAddress: req.ip,
				// userId: req.user?._id, // Uncomment if you have user authentication
			}).catch((slackErr) => {
				logger.error({ slackErr }, "Failed to send error to Slack.");
			});
		}
	}

	if (err.name === "ValidationError") {
		res
			.status(StatusCodes.BAD_REQUEST)
			.json(ServiceResponse.failure(err.message, err.errors, StatusCodes.BAD_REQUEST));
	}

	const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
	res
		.status(statusCode)
		.json(ServiceResponse.failure(err.message || "Internal Server Error", null, statusCode));
};

export default () => [unexpectedRequest, errorHandler];
