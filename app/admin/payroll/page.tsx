'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import RequireRole from '@/components/auth/RequireRole';
import PayoutsPanel from '@/components/payroll/PayoutsPanel';
import PaySetupPanel from '@/components/payroll/PaySetupPanel';

type Tab = 'payouts' | 'setup';

/**
 * Payroll, for admins: each person's pay and revenue shares, and the pay periods they
 * add up to.
 */
function Payroll() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = params.get('tab') === 'setup' ? 'setup' : 'payouts';
  const go = (t: Tab) => router.replace(t === 'payouts' ? pathname : `${pathname}?tab=${t}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Payroll</h1>
        <p className="text-white/60 mt-1 max-w-3xl">
          Set each person&apos;s pay and revenue shares, then mark finished periods paid with what was actually paid.
        </p>
      </div>
      <div role="tablist" className="flex gap-6 border-b border-surface-dark-lighter">
        {(
          [
            ['payouts', 'Payouts'],
            ['setup', 'Pay setup'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => go(id)}
            className={`-mb-px pb-2.5 text-sm border-b-2 ${tab === id ? 'border-primary text-white font-medium' : 'border-transparent text-white/60 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'payouts' ? <PayoutsPanel onSetup={() => go('setup')} /> : <PaySetupPanel />}
    </div>
  );
}

export default function PayrollPage() {
  return (
    <RequireRole roles={['admin']}>
      <Suspense fallback={<p className="text-white/50">Loading…</p>}>
        <Payroll />
      </Suspense>
    </RequireRole>
  );
}
