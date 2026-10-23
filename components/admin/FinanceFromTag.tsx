'use client';

import { useEffect, useState } from 'react';
import { siteSettingsApi } from '@/lib/api';

const EVENT = 'finance-start-changed';

/** Tells every tag on the page that the start date changed. */
export function notifyFinanceStartChanged(): void {
  window.dispatchEvent(new Event(EVENT));
}

export function formatFinanceDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * "Showing finances from 1 Oct 2026" on admin pages that leave out records before the
 * website's finance start date; nothing when none is set. Pass `date` when the page
 * already has it (the member portal gets it with its history).
 */
export default function FinanceFromTag({ date: given, className = '' }: { date?: string | null; className?: string }) {
  const [loaded, setLoaded] = useState<string | null>(null);
  useEffect(() => {
    if (given !== undefined) return;
    let alive = true;
    const load = () =>
      siteSettingsApi
        .financeStart()
        .then((r) => alive && setLoaded(r.date))
        .catch(() => undefined);
    load();
    window.addEventListener(EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(EVENT, load);
    };
  }, [given]);
  const date = given !== undefined ? given : loaded;
  if (!date) return null;
  return (
    <span
      title="Records before this date are left out"
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-xs font-medium text-amber-300 ${className}`}
    >
      <span className="material-symbols-outlined text-sm" aria-hidden="true">
        event
      </span>
      Showing finances from {formatFinanceDate(date)}
    </span>
  );
}
