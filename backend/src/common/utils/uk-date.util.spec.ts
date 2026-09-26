import {
  parseUKDateTimeToUTC,
  formatUKDate,
  formatUKDateTime,
  getUKEndOfDay,
  isRaffleLive,
  UK_TIMEZONE,
} from './uk-date.util';

describe('UK Date Utilities (Europe/London)', () => {
  it('should parse summer BST datetime (UTC+1) correctly', () => {
    // 2026-07-15 14:00 UK time (BST) should correspond to 13:00 UTC
    const utcDate = parseUKDateTimeToUTC('2026-07-15T14:00');
    expect(utcDate.toISOString()).toBe('2026-07-15T13:00:00.000Z');
  });

  it('should parse winter GMT datetime (UTC+0) correctly', () => {
    // 2026-12-15 14:00 UK time (GMT) should correspond to 14:00 UTC
    const utcDate = parseUKDateTimeToUTC('2026-12-15T14:00');
    expect(utcDate.toISOString()).toBe('2026-12-15T14:00:00.000Z');
  });

  it('should preserve already-offset ISO strings', () => {
    const iso = '2026-07-15T13:00:00.000Z';
    const parsed = parseUKDateTimeToUTC(iso);
    expect(parsed.toISOString()).toBe(iso);
  });

  it('should format date in UK timezone correctly', () => {
    // 13:00 UTC on 15 Jul is 14:00 BST
    const summerUtc = new Date('2026-07-15T13:00:00.000Z');
    const formattedDate = formatUKDate(summerUtc);
    expect(formattedDate).toBe('15 Jul 2026');

    const formattedTime = formatUKDateTime(summerUtc);
    expect(formattedTime).toContain('14:00');
    expect(formattedTime).toContain('BST');
  });

  it('should format winter date with GMT indicator', () => {
    const winterUtc = new Date('2026-12-15T14:00:00.000Z');
    const formattedTime = formatUKDateTime(winterUtc);
    expect(formattedTime).toContain('14:00');
    expect(formattedTime).toContain('GMT');
  });

  it('should accurately determine if raffle is live', () => {
    const now = new Date('2026-07-15T12:00:00.000Z');
    const start = new Date('2026-07-15T10:00:00.000Z');
    const end = new Date('2026-07-15T14:00:00.000Z');

    expect(isRaffleLive(start, end, now)).toBe(true);

    // Before start
    expect(isRaffleLive(new Date('2026-07-15T13:00:00.000Z'), end, now)).toBe(false);

    // After end
    expect(isRaffleLive(start, new Date('2026-07-15T11:00:00.000Z'), now)).toBe(false);
  });

  it('should compute getUKEndOfDay for given timestamp in London time', () => {
    const summerNow = new Date('2026-07-15T10:00:00.000Z');
    const endOfDay = getUKEndOfDay(summerNow);
    // 23:59:59.999 BST is 22:59:59.999 UTC
    expect(endOfDay.toISOString()).toBe('2026-07-15T22:59:59.999Z');
  });
});
