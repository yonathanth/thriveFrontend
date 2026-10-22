'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { meApi, MyMembership, ApiError } from '@/lib/api';
import { Card, Detail, ErrorNote, MembershipBadge, formatDate } from '@/components/portal/membership';

export default function MemberHomePage() {
  const [m, setM] = useState<MyMembership | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    meApi
      .membership()
      .then(setM)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load your membership'));
  }, []);

  if (error) return <ErrorNote message={error} />;
  if (!m) return <div className="h-48 bg-surface-dark rounded-xl border border-surface-dark-lighter animate-pulse" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Hi, {m.fullName.split(/\s+/)[0]}</h1>
        <p className="text-white/60 mt-1">Your membership at a glance.</p>
      </div>

      {m.isFrozen && (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm">
          Your membership is frozen
          {m.frozenUntilDate ? ` until ${formatDate(m.frozenUntilDate)}` : ''}.
          {m.frozenReason ? ` Reason: ${m.frozenReason}` : ''}
        </div>
      )}

      <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-[#10264d] via-[#0d1830] to-surface-dark p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <MembershipBadge m={m} />
              {m.planCategory && <span className="text-white/40 text-sm">{m.planCategory}</span>}
            </div>
            <p className="text-white text-3xl font-bold mt-3">{m.plan ?? 'No active plan'}</p>
            <p className="text-white/60 mt-1">
              {formatDate(m.startDate)} → {formatDate(m.endDate)}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-white text-6xl font-bold leading-none tracking-tight drop-shadow-[0_0_24px_rgba(59,140,255,0.6)]">
              {m.daysRemaining}
            </p>
            <p className="text-white/60 mt-2">{m.daysRemaining === 1 ? 'day left' : 'days left'}</p>
          </div>
        </div>
        {m.daysRemaining === 0 && (
          <p className="relative mt-6 text-orange-300 text-sm">
            Your membership has ended. Visit the front desk to renew.
          </p>
        )}
      </section>

      <Card title="Details">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Detail
            label="Visits used"
            value={m.visitsAllowed ? `${m.visitsUsed} / ${m.visitsAllowed}` : m.visitsUsed}
          />
          <Detail label="Member since" value={formatDate(m.memberSince)} />
          <Detail label="Trainer" value={m.trainer?.fullName ?? '—'} />
          <Detail label="Phone" value={m.phone} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/member/attendance" className="text-primary hover:text-primary/80 text-sm font-medium">
          See my attendance →
        </Link>
        <Link href="/member/history" className="text-primary hover:text-primary/80 text-sm font-medium">
          Plans, freezes &amp; payments →
        </Link>
      </div>
    </div>
  );
}
