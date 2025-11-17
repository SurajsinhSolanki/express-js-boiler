export const AppSettings = {
	MAX_LOGIN_ATTEMPTS: 3,
	CAN_LOGIN_AFTER_LOCKOUT_MINUTES: 1440,
	CAN_REQUEST_TOKEN_AFTER_MINUTES: 10,
	DATETIME_FORMAT: "YYYY-MM-DDTHH:mm:ssZ",
	DATE_FORMAT: "YYYY-MM-DD",
	TIME_FORMAT: "HH:mm:ss",
} as const;

export const TimeConstants = {
	SECOND: { seconds: 1 },
	MINUTE: { minutes: 1 },
	HOUR: { hours: 1 },
	DAY: { days: 1 },
	WEEK: { weeks: 1 },
	MONTH: { months: 1 },
	YEAR: { years: 1 },
} as const;
