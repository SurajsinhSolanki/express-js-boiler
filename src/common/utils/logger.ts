import pino from "pino";
import { ENV } from "@/common/utils/config";
import { getFilename } from "./filenameUtils";

const logLevels = {
	fatal: 60,
	error: 50,
	warn: 40,
	info: 30,
	debug: 20,
	trace: 10,
};

const baseConfig: pino.LoggerOptions = {
	level: ENV.LOG_LEVEL || (ENV.NODE_ENV === "production" ? "info" : "debug"),

	customLevels: logLevels,

	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers.cookie",
			"req.body.password",
			"req.body.token",
			"req.body.secret",
			'res.headers["set-cookie"]',
			"password",
			"token",
			"secret",
			"apiKey",
			"api_key",
		],
		remove: true,
	},

	timestamp: pino.stdTimeFunctions.isoTime,

	serializers: {
		req: pino.stdSerializers.req,
		res: pino.stdSerializers.res,
		err: pino.stdSerializers.err,
	},
};

const productionConfig: pino.LoggerOptions = {
	...baseConfig,

	...(ENV.LOG_FILE && {
		transport: {
			targets: [
				{
					target: "pino/file",
					level: "error",
					options: {
						destination: getFilename({
							subDir: "/logs",
							dateFormat: "yyyy-MM-dd",
							suffix: "error",
							extension: "log",
						}),
						mkdir: true,
					},
				},
				{
					target: "pino-pretty",
					options: { destination: 1 },
				},
			],
		},
	}),
};

const developmentConfig: pino.LoggerOptions = {
	...baseConfig,

	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "HH:MM:ss Z",
			ignore: "pid,hostname,service,version,environment",
			messageFormat: "{service}[{pid}]: {msg}",
			singleLine: false,
			hideObject: false,
		},
	},
};

const logger = pino(ENV.NODE_ENV === "production" ? productionConfig : developmentConfig);

export const createChildLogger = (module: string, context?: Record<string, any>) => {
	return logger.child({ module, ...context });
};

export const logError = (error: Error, context?: Record<string, any>) => {
	logger.error(
		{
			err: error,
			stack: error.stack,
			...context,
		},
		error.message,
	);
};

export const logPerformance = (
	operation: string,
	duration: number,
	context?: Record<string, any>,
) => {
	logger.info(
		{
			operation,
			duration,
			performance: true,
			...context,
		},
		`Operation ${operation} completed in ${duration}ms`,
	);
};

export const logSecurityEvent = (event: string, context?: Record<string, any>) => {
	logger.warn(
		{
			securityEvent: event,
			...context,
		},
		`Security event: ${event}`,
	);
};

export default logger;
