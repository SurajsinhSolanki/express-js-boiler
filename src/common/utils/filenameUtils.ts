import fs from "node:fs/promises";
import path from "node:path";
import type { DateTime } from "luxon";
import { formatDate as luxonFormatDate } from "./dateHelper";

interface FilenameOptions {
	subDir: string;
	extension: string;
	filenameWithoutExtension?: string;
	baseDir?: string;
	prefix?: string;
	suffix?: string;
	dateFormat?: string;
	separator?: string;
	timestamp?: Date | string | DateTime;
	mkdir?: boolean;
}

/**
 * Generates structured file path with Luxon date handling
 *
 * @example
 * // Basic daily log
 * await getFilename({ baseDir: './', subDir: 'logs' });
 * // → './logs/2023-11-15.log'
 *
 * // Custom format with Luxon tokens
 * await getFilename({
 *   baseDir: '/var/log',
 *   subDir: 'my-service',
 *   prefix: 'app',
 *   suffix: 'error',
 *   dateFormat: 'yyyy/MM/dd',
 *   extension: 'json'
 * });
 * // → '/var/log/my-service/app_2023/11/15_error.json'
 */
export const getFilename = async (options: FilenameOptions): Promise<string> => {
	const {
		filenameWithoutExtension,
		subDir,
		baseDir = process.cwd(),
		prefix,
		suffix,
		dateFormat,
		separator = "_",
		extension,
		timestamp = new Date(),
		mkdir = true,
	} = options;

	let datePart: string | Date | DateTime<boolean> = timestamp;
	if (dateFormat) {
		datePart = luxonFormatDate(timestamp, dateFormat);
	}

	const parts = [prefix, filenameWithoutExtension, datePart, suffix]
		.filter(Boolean)
		.join(separator);

	const cleanExtension = extension.replace(/^\./, "");
	const fullFilename = `${parts}.${cleanExtension}`;
	const fullPath = path.join(baseDir, subDir, fullFilename);

	if (mkdir) {
		await fs.mkdir(path.dirname(fullPath), { recursive: true }).catch(() => {});
	}

	return fullPath;
};
