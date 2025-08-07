import { DateTime, DurationLike, Interval } from 'luxon';

// Create a DateTime object from various inputs
export const createDate = (dateInput?: string | Date | DateTime | number): DateTime => {
  if (dateInput instanceof DateTime) return dateInput;
  if (dateInput instanceof Date) return DateTime.fromJSDate(dateInput);
  if (typeof dateInput === 'number') return DateTime.fromMillis(dateInput);
  if (typeof dateInput === 'string') return DateTime.fromISO(dateInput);
  return DateTime.now();
};

// Format dates
export const formatDate = (date: DateTime | Date | string, format: string = 'yyyy-MM-dd'): string => {
  const dt = createDate(date);
  return dt.toFormat(format);
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date: DateTime | Date | string): string => {
  const dt = createDate(date);
  return dt.toRelative() || '';
};

// Add duration to a date
export const addDuration = (date: DateTime | Date | string, duration: DurationLike): DateTime => {
  const dt = createDate(date);
  return dt.plus(duration);
};

// Subtract duration from a date
export const subtractDuration = (date: DateTime | Date | string, duration: DurationLike): DateTime => {
  const dt = createDate(date);
  return dt.minus(duration);
};

// Get difference between dates
export const diffDates = (
  date1: DateTime | Date | string,
  date2: DateTime | Date | string,
  unit: Intl.RelativeTimeFormatUnit = 'seconds'
): number => {
  const dt1 = createDate(date1);
  const dt2 = createDate(date2);
  return dt1.diff(dt2, unit).get(unit);
};

// Check if date is valid
export const isValidDate = (date: DateTime | Date | string): boolean => {
  try {
    const dt = createDate(date);
    return dt.isValid;
  } catch {
    return false;
  }
};

// Get start/end of time periods
export const startOfDay = (date: DateTime | Date | string): DateTime => createDate(date).startOf('day');
export const endOfDay = (date: DateTime | Date | string): DateTime => createDate(date).endOf('day');
export const startOfMonth = (date: DateTime | Date | string): DateTime => createDate(date).startOf('month');
export const endOfMonth = (date: DateTime | Date | string): DateTime => createDate(date).endOf('month');

// Timezone conversion
export const toTimezone = (date: DateTime | Date | string, zone: string): DateTime => {
  return createDate(date).setZone(zone);
};

// Human-readable date range
// formatRange('2023-01-01', '2024-03-15');
// Output: "January 1, 2023 – March 15, 2024"
// formatRange('2023-01-01T10:00:00', '2024-03-15T15:30:00', true);
// Output: "January 1, 2023, 10:00 AM – March 15, 2024, 3:30 PM"
export const formatRange = (
  start: DateTime | Date | string,
  end: DateTime | Date | string,
  includeTime: boolean = false
): string => {
  const startDate = createDate(start);
  const endDate = createDate(end);
  const interval = Interval.fromDateTimes(startDate, endDate);

  return interval.toLocaleString({
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime && {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  });
};

// Export commonly used constants
export const SECOND = { seconds: 1 };
export const MINUTE = { minutes: 1 };
export const HOUR = { hours: 1 };
export const DAY = { days: 1 };
export const WEEK = { weeks: 1 };
export const MONTH = { months: 1 };
export const YEAR = { years: 1 };

// Example usage:
// const now = DateTime.now();
// const tomorrow = addDuration(now, DAY);
// const formatted = formatDate(tomorrow, 'MMM dd, yyyy');
