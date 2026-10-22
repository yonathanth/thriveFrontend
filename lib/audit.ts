/** Display helpers for the desktop app's audit log. */

/** "plan_change" → "Plan change" */
export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  const s = value.replace(/_/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const AREA_ICONS: Record<string, string> = {
  finance: 'payments',
  member: 'person',
  staff: 'badge',
  service: 'category',
  settings: 'settings',
  sms: 'sms',
  drop_in: 'confirmation_number',
  addon: 'add_circle',
  user: 'manage_accounts',
  device: 'door_front',
  discount: 'sell',
  group: 'groups',
};

export function areaIcon(area: string): string {
  return AREA_ICONS[area] ?? 'history';
}

/** A change recorded as { field: { from, to } }, or null when the detail is something else. */
export function fieldChanges(detail: unknown): { field: string; from: unknown; to: unknown }[] | null {
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return null;
  const entries = Object.entries(detail as Record<string, unknown>);
  if (entries.length === 0) return null;
  const changes = entries.map(([field, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) && ('from' in v || 'to' in v)
      ? { field, from: (v as { from?: unknown }).from, to: (v as { to?: unknown }).to }
      : null
  );
  return changes.every(Boolean) ? (changes as { field: string; from: unknown; to: unknown }[]) : null;
}

/** A detail value as text. */
export function showValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
