export const UK_TIMEZONE = 'Europe/London';

/**
 * Parses a date or datetime string, specifically interpreting local date-time strings
 * (such as "YYYY-MM-DDTHH:mm" produced by <input type="datetime-local">)
 * as Europe/London (UK) time (BST in summer, GMT in winter).
 */
export function parseUKDateTimeToUTC(dateInput: string | Date | null | undefined): Date {
  if (!dateInput) {
    return new Date(NaN);
  }

  if (dateInput instanceof Date) {
    return dateInput;
  }

  const str = String(dateInput).trim();

  // If already contains Z or explicit timezone offset, parse directly
  if (str.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(str)) {
    return new Date(str);
  }

  // Handle "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
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
  const londonAsUtc = Date.UTC(p.year, p.month - 1, day, londonHour, p.minute, p.second, millisecond);
  const offset = londonAsUtc - guessUtc.getTime();

  return new Date(guessUtc.getTime() - offset);
}

/**
 * Converts a datetime input string (e.g. from <input type="datetime-local">)
 * to an ISO string representing that exact UK time in UTC.
 */
export function parseUKInputToISO(ukDateTimeStr: string): string {
  if (!ukDateTimeStr) return '';
  const date = parseUKDateTimeToUTC(ukDateTimeStr);
  return isNaN(date.getTime()) ? '' : date.toISOString();
}

/**
 * Converts a UTC Date/ISO string to "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
 * represented specifically in UK time (Europe/London).
 */
export function formatDateForUKInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const p: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') p[part.type] = part.value;
  }

  const hour = p.hour === '24' ? '00' : p.hour;
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}`;
}

/**
 * Formats a date in UK time (Europe/London), e.g. "26 Sep 2026".
 */
export function formatUKDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '—';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    ...options,
  }).format(d);
}

/**
 * Formats a date and time in UK time (Europe/London), including BST/GMT indicator.
 * E.g. "26 Sep 2026, 14:00 BST"
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
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '—';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    ...options,
  }).format(d);
}

export type RaffleTimingStatus = 'UPCOMING' | 'LIVE' | 'ENDED';

/**
 * Evaluates whether a raffle is UPCOMING, LIVE, or ENDED based on current time.
 */
export function getRaffleTimingStatus(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  now = new Date(),
): {
  status: RaffleTimingStatus;
  isLive: boolean;
  startsInMs: number;
  endsInMs: number;
  remainingMs: number;
} {
  const nowMs = now.getTime();
  const startMs = startDate ? new Date(startDate).getTime() : 0;
  const endMs = endDate ? new Date(endDate).getTime() : Infinity;

  const startsInMs = startMs - nowMs;
  const endsInMs = endMs - nowMs;

  if (startMs > nowMs) {
    return {
      status: 'UPCOMING',
      isLive: false,
      startsInMs,
      endsInMs,
      remainingMs: startsInMs,
    };
  }

  if (endMs < nowMs) {
    return {
      status: 'ENDED',
      isLive: false,
      startsInMs,
      endsInMs,
      remainingMs: 0,
    };
  }

  return {
    status: 'LIVE',
    isLive: true,
    startsInMs,
    endsInMs,
    remainingMs: endsInMs,
  };
}
