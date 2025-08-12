import { DateTime, DurationLike, Interval } from 'luxon';

export const createDate = (dateInput?: string | Date | DateTime | number): DateTime => {
  if (dateInput instanceof DateTime) return dateInput;
  if (dateInput instanceof Date) return DateTime.fromJSDate(dateInput);
  if (typeof dateInput === 'number') return DateTime.fromMillis(dateInput);
  if (typeof dateInput === 'string') return DateTime.fromISO(dateInput);
  return DateTime.now();
};

export const formatDate = (date: DateTime | Date | string, format: string = 'yyyy-MM-dd'): string => {
  const dt = createDate(date);
  return dt.toFormat(format);
};

export const getRelativeTime = (date: DateTime | Date | string): string => {
  const dt = createDate(date);
  return dt.toRelative() || '';
};

export const addDuration = (date: DateTime | Date | string, duration: DurationLike): DateTime => {
  const dt = createDate(date);
  return dt.plus(duration);
};

export const subtractDuration = (date: DateTime | Date | string, duration: DurationLike): DateTime => {
  const dt = createDate(date);
  return dt.minus(duration);
};

export const diffDates = (
  date1: DateTime | Date | string,
  date2: DateTime | Date | string,
  unit: Intl.RelativeTimeFormatUnit = 'seconds'
): number => {
  const dt1 = createDate(date1);
  const dt2 = createDate(date2);
  return dt1.diff(dt2, unit).get(unit);
};

export const isValidDate = (date: DateTime | Date | string): boolean => {
  try {
    const dt = createDate(date);
    return dt.isValid;
  } catch {
    return false;
  }
};

export const startOfDay = (date: DateTime | Date | string): DateTime => createDate(date).startOf('day');
export const endOfDay = (date: DateTime | Date | string): DateTime => createDate(date).endOf('day');
export const startOfMonth = (date: DateTime | Date | string): DateTime => createDate(date).startOf('month');
export const endOfMonth = (date: DateTime | Date | string): DateTime => createDate(date).endOf('month');

export const toTimezone = (date: DateTime | Date | string, zone: string): DateTime => {
  return createDate(date).setZone(zone);
};

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

export const SECOND = { seconds: 1 };
export const MINUTE = { minutes: 1 };
export const HOUR = { hours: 1 };
export const DAY = { days: 1 };
export const WEEK = { weeks: 1 };
export const MONTH = { months: 1 };
export const YEAR = { years: 1 };
