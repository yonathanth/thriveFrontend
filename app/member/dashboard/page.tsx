'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarCheck, CreditCard, History, UserRound } from 'lucide-react';
import { useMemberMembership } from '@/hooks/useMemberMembership';
import { Card, Detail, ErrorNote, MembershipBadge, formatDate } from '@/components/portal/membership';
import { Suspense } from 'react';
import { OnlinePaymentNotice, RenewButton } from '@/components/portal/RenewMembership';

const actions = [
  { title: 'See my attendance', description: 'View your check-ins and gym visits.', href: '/member/attendance', icon: CalendarCheck },
  { title: 'My membership', description: 'Current plan, renewal and past memberships.', href: '/member', icon: CreditCard },
  { title: 'Plans, freezes & payments', description: 'Review your full account history.', href: '/member/history', icon: History },
  { title: 'My profile', description: 'Contact details and password settings.', href: '/member/profile', icon: UserRound },
];

export default function MemberDashboardPage() {
  const { membership: m, error } = useMemberMembership();
  if (error) return <ErrorNote message={error} />;
  if (!m) return <div role="status" aria-label="Loading dashboard" className="h-48 bg-surface-dark rounded-xl border border-surface-dark-lighter animate-pulse" />;

  return <div className="space-y-6">
    <div><h1 className="text-white text-2xl font-semibold">Hi, {m.fullName.split(/\s+/)[0]}</h1><p className="text-white/60 mt-1">Your Thrive dashboard. Everything you need in one place.</p></div>
    <Suspense fallback={null}><OnlinePaymentNotice /></Suspense>
    <Card title="Membership" action={<MembershipBadge m={m} />}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xl font-semibold text-white">{m.plan ?? 'No active plan'}</p><p className="mt-1 text-sm text-white/60">{m.isFrozen ? 'Your membership is frozen.' : m.daysRemaining === 0 ? 'Your membership has ended.' : `${m.daysRemaining} ${m.daysRemaining === 1 ? 'day' : 'days'} remaining.`}</p></div>
        <div className="flex flex-wrap items-center gap-3">
          {!m.isFrozen && <RenewButton />}
          <Link href="/member" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-5 text-sm text-white">View membership<ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </Card>
    <Card title="Details"><div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <Detail label="Visits used" value={m.visitsAllowed ? `${m.visitsUsed} / ${m.visitsAllowed}` : m.visitsUsed} />
      <Detail label="Member since" value={formatDate(m.memberSince)} />
      <Detail label="Trainer" value={m.trainer?.fullName ?? '—'} />
      <Detail label="Phone" value={m.phone} />
    </div></Card>
    <section aria-labelledby="member-actions"><h2 id="member-actions" className="mb-4 text-lg font-semibold text-white">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2">{actions.map(({ title, description, href, icon: Icon }) => <Link key={href} href={href} className="group flex min-w-0 items-start gap-4 rounded-xl border border-white/10 bg-surface-dark p-5 transition-colors hover:border-primary/40 hover:bg-primary/5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={20} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-relaxed text-white/60">{description}</p></div><ArrowUpRight className="shrink-0 text-white/40 group-hover:text-primary" size={18} aria-hidden="true" />
      </Link>)}</div>
    </section>
  </div>;
}
