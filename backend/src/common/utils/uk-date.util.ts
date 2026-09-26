export const UK_TIMEZONE = 'Europe/London';

/**
 * Parses a date string or Date into a UTC Date object, interpreting local datetime strings
 * (without timezone offsets like YYYY-MM-DDTHH:mm) specifically in the UK timezone (Europe/London, BST/GMT).
 */
export function parseUKDateTimeToUTC(dateInput: string | Date | null | undefined): Date {
  if (!dateInput) {
    return new Date(NaN);
  }

  if (dateInput instanceof Date) {
    return dateInput;
  }

  const str = String(dateInput).trim();

  // If already has explicit UTC 'Z' or timezone offset '+01:00' / '-05:00', parse directly
  if (str.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(str)) {
    return new Date(str);
  }

  // Handle standard 'YYYY-MM-DDTHH:mm' or 'YYYY-MM-DDTHH:mm:ss' or 'YYYY-MM-DD HH:mm:ss'
  const isoLike = str.replace(' ', 'T');
  const [datePart, timePart = '00:00:00'] = isoLike.split('T');

  const dateSegments = datePart.split('-').map(Number);
  if (dateSegments.length !== 3 || dateSegments.some(isNaN)) {
    return new Date(str);
  }

  const [year, month, day] = dateSegments;
  const timeSegments = timePart.split(':');
  const hour = Number(timeSegments[0]) || 0;
  const minute = Number(timeSegments[1]) || 0;
  const secParts = (timeSegments[2] || '0').split('.');
  const second = Number(secParts[0]) || 0;
  const millisecond = Number(secParts[1]?.padEnd(3, '0').slice(0, 3)) || 0;

  // 1. Initial guess in UTC
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));

  // 2. Format in Europe/London to determine the daylight saving offset (BST = +1h, GMT = +0h)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(guessUtc);
  const p: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      p[part.type] = Number(part.value);
    }
  }

  const londonHour = p.hour === 24 ? 0 : p.hour;
  const londonAsUtc = Date.UTC(p.year, p.month - 1, p.day, londonHour, p.minute, p.second, millisecond);
  const offset = londonAsUtc - guessUtc.getTime();

  return new Date(guessUtc.getTime() - offset);
}

/**
 * Format a date in UK (Europe/London) timezone.
 */
export function formatUKDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    ...options,
  }).format(d);
}

/**
 * Format a date and time in UK (Europe/London) timezone including BST/GMT indicator.
 */
export function formatUKDateTime(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  },
): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    ...options,
  }).format(d);
}

/**
 * Returns the end of today (23:59:59.999) in UK (Europe/London) time represented as UTC Date.
 */
export function getUKEndOfDay(now = new Date()): Date {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const p: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') p[part.type] = part.value;
  }

  // End of day is 23:59:59.999 UK time
  return parseUKDateTimeToUTC(`${p.year}-${p.month}-${p.day}T23:59:59.999`);
}

/**
 * Checks if current date falls within startDate and endDate
 */
export function isRaffleLive(
  startDate: Date | string,
  endDate: Date | string,
  now = new Date(),
): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return start <= now && now <= end;
}
