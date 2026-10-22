// Helpers for rows synced from desktop tables (see DesktopRow in lib/api.ts).

/**
 * Parses a desktop date. SQLite stores them as "2026-10-01 00:00:00", which Safari
 * cannot parse, so the space becomes a "T".
 */
export function desktopDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value === '') return null;
  const d = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

export function formatDesktopDate(value: unknown): string {
  const d = desktopDate(value);
  return d
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';
}

export function str(value: unknown): string | null {
  return value == null || value === '' ? null : String(value);
}

export function num(value: unknown): number | null {
  const n = typeof value === 'number' ? value : value == null ? NaN : Number(value);
  return isNaN(n) ? null : n;
}

export function formatETB(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** "recovery_wellness" -> "Recovery wellness" */
export function humanize(value: unknown): string {
  const s = str(value);
  if (!s) return '-';
  const spaced = s.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
