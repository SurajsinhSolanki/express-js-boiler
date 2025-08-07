import path from 'node:path';
import fs from 'node:fs/promises';
import { formatDate as luxonFormatDate } from './dateHelper';
import { DateTime } from 'luxon';

interface FilenameOptions {
  subDir: string; // Subdirectory under base (required)
  extension: string; // File extension (required)
  filenameWithoutExtension?: string; // Custom filename
  baseDir?: string; // Base directory or undefined
  prefix?: string; // Filename prefix or undefined
  suffix?: string; // Filename suffix or undefined
  dateFormat?: string; // Luxon date format tokens or undefined (default: 'yyyy-MM-dd')
  separator?: string; // Separator between parts or undefined (default: '_')
  timestamp?: Date | string | DateTime; // Accepts multiple date formats
  mkdir?: boolean; // Auto-create directories (default: true)
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
    separator = '_',
    extension,
    timestamp = new Date(),
    mkdir = true
  } = options;

  // Use Luxon for date handling
  let datePart = undefined;
  if (dateFormat) {
    datePart = luxonFormatDate(timestamp, dateFormat);
  }

  // Build filename parts
  const parts = [prefix, filenameWithoutExtension, datePart, suffix].filter(Boolean).join(separator);

  // Clean extension (remove leading dot if present)
  const cleanExtension = extension.replace(/^\./, '');
  const fullFilename = `${parts}.${cleanExtension}`;
  const fullPath = path.join(baseDir, subDir, fullFilename);

  // Create directory if needed
  if (mkdir) {
    await fs.mkdir(path.dirname(fullPath), { recursive: true }).catch(() => {});
  }

  return fullPath;
};
