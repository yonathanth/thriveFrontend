'use client';

import { useCallback, useEffect, useState } from 'react';
import RequireRole from '@/components/auth/RequireRole';
import { ApiError, onlinePaymentsApi, type AdminOnlinePayments } from '@/lib/api';
import { formatETB } from '@/lib/desktop';
import { formatDate } from '@/components/portal/membership';

const STATUSES: Record<string, { label: string; tone: string }> = {
  paid: { label: 'Waiting for staff', tone: 'text-amber-300' },
  applied: { label: 'Applied', tone: 'text-green-400' },
  rejected: { label: 'Rejected · to refund', tone: 'text-red-300' },
  refunded: { label: 'Refunded', tone: 'text-white/60' },
  initiated: { label: 'Not finished', tone: 'text-white/50' },
  failed: { label: 'Failed', tone: 'text-red-300' },
  cancelled: { label: 'Cancelled', tone: 'text-white/50' },
};

const field =
  'h-10 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50';

/**
 * Every online renewal attempt, for checking against SantimPay's statements and for
 * helping members. Read-only: staff apply or reject payments in the gym app.
 */
function OnlinePaymentsPage() {
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminOnlinePayments | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    onlinePaymentsApi
      .list({ status: status || undefined, from: from || undefined, to: to || undefined, page })
      .then(setResult)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Could not load online payments'));
  }, [status, from, to, page]);

  useEffect(() => {
    load();
  }, [load]);

  const total = (s: string[]) =>
    (result?.totals ?? []).filter((t) => s.includes(t.status)).reduce(
      (acc, t) => ({ count: acc.count + t.count, amount: acc.amount + t.amount }),
      { count: 0, amount: 0 },
    );
  const received = total(['paid', 'applied', 'rejected', 'refunded']);
  const waiting = total(['paid']);
  const toRefund = total(['rejected']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Online Payments</h1>
        <p className="text-white/60 mt-1">
          Renewals members paid on the website through SantimPay. Staff apply or reject them in the gym app.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Received', v: received },
          { label: 'Waiting for staff', v: waiting },
          { label: 'To refund', v: toRefund },
        ].map(({ label, v }) => (
          <div key={label} className="rounded-xl border border-surface-dark-lighter bg-surface-dark p-4">
            <p className="text-white/60 text-sm">{label}</p>
            <p className="text-white text-xl font-semibold mt-1">{formatETB(v.amount)}</p>
            <p className="text-white/40 text-xs">{v.count} payment{v.count === 1 ? '' : 's'}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-surface-dark-lighter bg-surface-dark p-4">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={field} aria-label="Status">
          <option value="">All statuses</option>
          {Object.entries(STATUSES).map(([k, s]) => (
            <option key={k} value={k}>{s.label}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={field} aria-label="From" />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={field} aria-label="To" />
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm" role="alert">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-surface-dark-lighter bg-surface-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/50 border-b border-surface-dark-lighter">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Member</th>
              <th className="p-3 font-medium">Plan</th>
              <th className="p-3 font-medium text-right">Amount</th>
              <th className="p-3 font-medium">Paid via</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">SantimPay ref</th>
            </tr>
          </thead>
          <tbody>
            {!result ? (
              <tr><td colSpan={7} className="p-6 text-center text-white/40">Loading…</td></tr>
            ) : result.data.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-white/40">No online payments.</td></tr>
            ) : (
              result.data.map((p) => {
                const s = STATUSES[p.status] ?? { label: p.status, tone: 'text-white/60' };
                return (
                  <tr key={p.reference} className="border-b border-surface-dark-lighter last:border-0 align-top">
                    <td className="p-3 text-white/80 whitespace-nowrap">{formatDate(p.paidAt ?? p.createdAt, true)}</td>
                    <td className="p-3 text-white">
                      {p.memberName}
                      <span className="block text-white/40 text-xs">
                        {p.kind === 'join' ? (p.memberLocalId != null ? `New member #${p.memberLocalId}` : 'New member (joining)') : `#${p.memberLocalId}`}
                        {p.phoneNumber ? ` · ${p.phoneNumber}` : ''}
                      </span>
                    </td>
                    <td className="p-3 text-white/80">{p.plan}</td>
                    <td className="p-3 text-white text-right tabular-nums">{formatETB(p.amount)}</td>
                    <td className="p-3 text-white/80">{p.paidVia ?? '—'}</td>
                    <td className="p-3">
                      <span className={s.tone}>{s.label}</span>
                      {(p.decidedBy || p.note) && (
                        <span className="block text-white/40 text-xs">
                          {p.decidedBy ? `by ${p.decidedBy}` : ''}
                          {p.decidedBy && p.note ? ' · ' : ''}
                          {p.note ?? ''}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-white/50 text-xs break-all">{p.providerTxnId ?? '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {result && result.meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 text-sm text-white/70">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-9 px-4 rounded-lg border border-white/15 disabled:opacity-40">Previous</button>
          <span>Page {result.meta.page} of {result.meta.totalPages}</span>
          <button type="button" disabled={page >= result.meta.totalPages} onClick={() => setPage(page + 1)} className="h-9 px-4 rounded-lg border border-white/15 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole roles={['admin', 'manager']}>
      <OnlinePaymentsPage />
    </RequireRole>
  );
}
