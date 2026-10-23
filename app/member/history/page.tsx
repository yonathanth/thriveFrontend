'use client';

import { useEffect, useState } from 'react';
import { meApi, MyHistory, ApiError } from '@/lib/api';
import { formatETB } from '@/lib/desktop';
import { Card, ErrorNote, FreezeHistory, PlanHistory, formatDate } from '@/components/portal/membership';
import { formatFinanceDate } from '@/components/admin/FinanceFromTag';

export default function MemberHistoryPage() {
  const [history, setHistory] = useState<MyHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    meApi
      .history()
      .then(setHistory)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load your history'));
  }, []);

  if (error) return <ErrorNote message={error} />;
  if (!history) return <div className="h-48 bg-surface-dark rounded-xl border border-surface-dark-lighter animate-pulse" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">History</h1>
        <p className="text-white/60 mt-1">Your plans, freezes and payments.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Plans">
          <PlanHistory rows={history.planHistory} />
        </Card>
        <Card title="Freezes">
          <FreezeHistory rows={history.freezeHistory} />
        </Card>
      </div>

      <Card title="Payments">
        {history.financeFrom && (
          <p className="text-white/50 text-xs mb-3">Showing payments from {formatFinanceDate(history.financeFrom)}.</p>
        )}
        {history.payments.length === 0 ? (
          <p className="text-white/40 text-sm">No payments recorded.</p>
        ) : (
          <ul className="divide-y divide-surface-dark-lighter">
            {history.payments.map((p) => (
              <li key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <p className="text-white">{p.plan ?? p.description ?? p.type}</p>
                  <p className="text-white/40 text-xs">
                    {formatDate(p.date)}
                    {p.periodStart && p.periodEnd
                      ? ` · covers ${formatDate(p.periodStart)} → ${formatDate(p.periodEnd)}`
                      : ''}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-white font-medium">{formatETB(p.amount)}</p>
                  {p.paymentStatus !== 'paid' && <p className="text-orange-400 text-xs">{p.paymentStatus}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
