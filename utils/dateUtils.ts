/**
 * Returns today's date as a string in YYYY-MM-DD format.
 * Used as a key for daily data storage.
 */
export function todayKey(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

/**
 * Formats an ISO timestamp to a localized time string.
 */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Formats a YYYY-MM-DD date string to a localized date string.
 */
export function formatDate(day: string): string {
  if (!day) return '';
  const [y, m, d] = day.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
