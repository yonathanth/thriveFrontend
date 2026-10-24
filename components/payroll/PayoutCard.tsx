'use client';

import { useState } from 'react';
import type { Payout, PayoutStatus } from '@/lib/api';

export function money(n: number): string {
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ETB`;
}

export function formatDay(iso: string): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS: Record<PayoutStatus, { label: string; className: string }> = {
  building: { label: 'In progress', className: 'bg-white/5 text-white/60 border-white/10' },
  due: { label: 'Due', className: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
};

/**
 * One pay period: who, when, status and total, opening to its lines and, once paid,
 * what was actually paid. `children` goes below (e.g. the pay form).
 */
export default function PayoutCard({
  payout,
  showName,
  children,
  defaultOpen = false,
}: {
  payout: Payout;
  showName?: boolean;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const status = STATUS[payout.status];
  const a = payout.payment;
  const paid = a?.paidAmount;
  const differs = paid != null && Math.abs(paid - payout.calculatedAmount) >= 0.005;

  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex flex-wrap items-center gap-3 p-4 text-left"
      >
        <span className="material-symbols-outlined text-white/40 text-xl">{open ? 'expand_less' : 'expand_more'}</span>
        <div className="flex-1 min-w-[10rem]">
          {showName && <div className="text-white font-semibold">{payout.staffName}</div>}
          <div className={showName ? 'text-white/50 text-sm' : 'text-white font-medium'}>
            {formatDay(payout.periodStart)} – {formatDay(payout.periodLast)}
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}>{status.label}</span>
        <div className="text-right min-w-[8rem]">
          <div className="text-white font-semibold tabular-nums">{money(paid ?? payout.calculatedAmount)}</div>
          {differs && <div className="text-white/40 text-xs">calculated {money(payout.calculatedAmount)}</div>}
        </div>
      </button>

      {open && (
        <div className="border-t border-surface-dark-lighter px-4 py-3 space-y-3">
          {payout.lines.length === 0 ? (
            <p className="text-white/40 text-sm">Nothing earned in this period.</p>
          ) : (
            <ul className="space-y-1.5">
              {payout.lines.map((l, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-1 text-white/70">{l.label}</span>
                  <span
                    className={`tabular-nums ${l.amount < 0 ? 'text-red-400' : l.kind === 'commission' ? 'text-emerald-400' : 'text-white/80'}`}
                  >
                    {l.amount < 0 ? '−' : ''}
                    {money(Math.abs(l.amount))}
                  </span>
                </li>
              ))}
              <li className="flex gap-3 text-sm border-t border-surface-dark-lighter pt-1.5">
                <span className="flex-1 text-white/50">Calculated</span>
                <span className="tabular-nums text-white font-medium">{money(payout.calculatedAmount)}</span>
              </li>
            </ul>
          )}
          {payout.status === 'building' && (
            <p className="text-white/40 text-xs">A running estimate; it updates as attendance and payments sync.</p>
          )}
          {payout.status === 'due' && (
            <p className="text-white/40 text-xs">
              The period has ended. Figures still update if the gym app syncs late payments, until it is paid.
            </p>
          )}
          {a && (
            <div className="text-sm text-white/60 bg-surface-dark-lighter/50 rounded-lg p-3 space-y-0.5">
              <div>
                <span className="text-white/80 font-medium">{money(a.paidAmount)}</span> paid {formatDay(a.paidDate)}
                {a.paymentMethod ? ` by ${a.paymentMethod}` : ''}
              </div>
              {a.note && <div>Note: {a.note}</div>}
              {a.paidByName && (
                <div className="text-white/40 text-xs">
                  Recorded by {a.paidByName}
                  {a.paidAt ? ` on ${new Date(a.paidAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}` : ''}
                </div>
              )}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
