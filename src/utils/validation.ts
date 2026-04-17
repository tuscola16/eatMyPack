export const RACE_TITLE_MAX_LENGTH = 60;

export function sanitizeRaceTitle(input: string): string {
  return input.replace(/[^\p{L}\p{N}\s,.']/gu, '').slice(0, RACE_TITLE_MAX_LENGTH);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function isValidRaceDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map((p) => parseInt(p, 10));
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isValidStartTime(s: string): boolean {
  if (!TIME_RE.test(s)) return false;
  const [h, m] = s.split(':').map((p) => parseInt(p, 10));
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatRaceDateTime(date?: string, time?: string): string {
  const parts: string[] = [];
  if (date && isValidRaceDate(date)) {
    const [y, m, d] = date.split('-').map((p) => parseInt(p, 10));
    parts.push(`${MONTHS[m - 1]} ${d}, ${y}`);
  }
  if (time && isValidStartTime(time)) {
    const [h, mm] = time.split(':').map((p) => parseInt(p, 10));
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    parts.push(`${h12}:${String(mm).padStart(2, '0')} ${suffix}`);
  }
  return parts.join(' · ');
}
