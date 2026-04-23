export function formatWallClockTime(
  startTime: string,
  offsetHours: number,
  format: '12h' | '24h',
): string {
  const [startH, startM] = startTime.split(':').map(Number);
  const totalMinutes = startH * 60 + startM + Math.round(offsetHours * 60);
  const dayOffset = Math.floor(totalMinutes / 1440);
  const minutesInDay = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(minutesInDay / 60);
  const m = minutesInDay % 60;
  const dayLabel = dayOffset > 0 ? ` D${dayOffset + 1}` : '';
  if (format === '24h') {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}${dayLabel}`;
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}${dayLabel}`;
}
