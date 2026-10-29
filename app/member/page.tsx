'use client';

import { ErrorNote, MembershipBadge, formatDate } from '@/components/portal/membership';
import { useMemberMembership } from '@/hooks/useMemberMembership';
import MembershipPlanHistory from '@/components/portal/MembershipPlanHistory';
import { Suspense } from 'react';
import { OnlinePaymentNotice, RenewButton } from '@/components/portal/RenewMembership';

export default function MemberMembershipPage() {
  const { membership: m, error } = useMemberMembership();

  if (error) return <ErrorNote message={error} />;
  if (!m) return <div className="h-48 bg-surface-dark rounded-xl border border-surface-dark-lighter animate-pulse" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">My membership</h1>
        <p className="text-white/60 mt-1">Your current plan and membership history.</p>
      </div>

      <Suspense fallback={null}>
        <OnlinePaymentNotice />
      </Suspense>

      {m.isFrozen && (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm">
          Your membership is frozen
          {m.frozenUntilDate ? ` until ${formatDate(m.frozenUntilDate)}` : ''}.
          {m.frozenReason ? ` Reason: ${m.frozenReason}` : ''}
        </div>
      )}

      <section className="portal-membership relative overflow-hidden rounded-xl border p-6 md:p-8">
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
            <p className="portal-membership-days text-6xl font-semibold leading-none tracking-tight tabular-nums">
              {m.daysRemaining}
            </p>
            <p className="text-white/60 mt-2">{m.daysRemaining === 1 ? 'day left' : 'days left'}</p>
          </div>
        </div>
        {!m.isFrozen && (
          <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <RenewButton />
            {m.daysRemaining === 0 && <p className="text-sm text-orange-300">Your membership has ended.</p>}
          </div>
        )}
      </section>

      <MembershipPlanHistory />
    </div>
  );
}
