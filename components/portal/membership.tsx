import type { MembershipSummary } from '@/lib/api';

export function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/** Membership state for display: frozen, expired, ending soon or active. */
export function membershipState(m: Pick<MembershipSummary, 'isFrozen' | 'daysRemaining'>) {
  if (m.isFrozen) return { label: 'Frozen', className: 'bg-blue-500/10 text-blue-400' };
  if (m.daysRemaining === 0) return { label: 'Expired', className: 'bg-red-500/10 text-red-400' };
  if (m.daysRemaining <= 7) return { label: 'Ending soon', className: 'bg-orange-500/10 text-orange-400' };
  return { label: 'Active', className: 'bg-emerald-500/10 text-emerald-400' };
}

export function MembershipBadge({ m }: { m: Pick<MembershipSummary, 'isFrozen' | 'daysRemaining'> }) {
  const s = membershipState(m);
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

/** A labelled value in a detail card. */
export function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-white/40 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white mt-1">{value ?? '—'}</p>
    </div>
  );
}

export function Card({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bg-surface-dark rounded-xl border border-white/5 p-6">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-white text-lg font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm" role="alert">
      {message}
    </div>
  );
}

/** Desktop history rows use snake_case columns; show whichever of these keys is present. */
export function rowDate(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v) return formatDate(v);
  }
  return '—';
}

export function rowText(row: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v;
    if (typeof v === 'number') return String(v);
  }
  return null;
}

/** Freeze periods from the desktop's freeze_history rows. */
export function FreezeHistory({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return <p className="text-white/40 text-sm">No freezes.</p>;
  return (
    <ul className="divide-y divide-surface-dark-lighter">
      {rows.map((f, i) => (
        <li key={String(f.id ?? i)} className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-white">
            {rowDate(f, 'start_date', 'frozen_start_date', 'created_at')} →{' '}
            {rowDate(f, 'end_date', 'frozen_until_date', 'unfrozen_at')}
          </span>
          <span className="text-white/50 text-sm">{rowText(f, 'reason', 'frozen_reason', 'note') ?? ''}</span>
        </li>
      ))}
    </ul>
  );
}

/** Plan periods from the desktop's member_plan_history rows. */
export function PlanHistory({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return <p className="text-white/40 text-sm">No earlier plans.</p>;
  return (
    <ul className="divide-y divide-surface-dark-lighter">
      {rows.map((p, i) => (
        <li key={String(p.id ?? i)} className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-white">{rowText(p, 'service_name', 'plan_name', 'name') ?? 'Plan'}</span>
          <span className="text-white/50 text-sm">
            {rowDate(p, 'start_date')} → {rowDate(p, 'end_date')}
          </span>
        </li>
      ))}
    </ul>
  );
}
