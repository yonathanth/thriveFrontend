'use client';

import { useEffect, useState } from 'react';
import { payrollApi, type Payout } from '@/lib/api';
import PayoutCard, { money } from './PayoutCard';

/** The signed-in staff member's payslips: the current period's estimate and past periods. */
export default function MyPay() {
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    payrollApi
      .mine()
      .then(setPayouts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your pay'));
  }, []);

  const current = payouts?.filter((p) => p.status === 'building') ?? [];
  const past = payouts?.filter((p) => p.status !== 'building') ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">My pay</h1>
        <p className="text-white/60 mt-1">Your payslips: what each pay period is made of and what was paid.</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!payouts ? (
        !error && <p className="text-white/50">Loading…</p>
      ) : payouts.length === 0 ? (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-8 text-center text-white/50">
          No pay periods yet. Your pay is set up at the gym.
        </div>
      ) : (
        <>
          {current.map((p) => (
            <section key={p.id} className="space-y-2">
              <h2 className="text-white/80 font-semibold">This period so far</h2>
              <p className="text-white/50 text-sm">
                {money(p.calculatedAmount)} so far. It updates as the period goes on.
              </p>
              <PayoutCard payout={p} defaultOpen />
            </section>
          ))}
          {past.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-white/80 font-semibold">Past periods</h2>
              <div className="space-y-3">
                {past.map((p) => (
                  <PayoutCard key={p.id} payout={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
