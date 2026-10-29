'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, X } from 'lucide-react';
import { ApiError, meApi, type MyOnlinePayment, type RenewalOptions } from '@/lib/api';
import { formatDate } from '@/components/portal/membership';

const money = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ETB`;

/**
 * Renew button and its modal: first "same plan or another?", then pay. Paying sends
 * the member to SantimPay, which brings them back to the Membership page.
 */
export function RenewButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm text-white ${className}`}
      >
        <CreditCard size={17} aria-hidden="true" />
        Renew
      </button>
      {open && <RenewModal onClose={() => setOpen(false)} />}
    </>
  );
}

function RenewModal({ onClose }: { onClose: () => void }) {
  const [options, setOptions] = useState<RenewalOptions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'start' | 'choose'>('start');
  const [chosen, setChosen] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    meApi
      .renewalOptions()
      .then((o) => {
        setOptions(o);
        const current = o.plans.find((p) => p.current);
        setChosen(current?.id ?? o.plans[0]?.id ?? null);
        // No current plan on sale: straight to choosing one.
        if (!current) setStep('choose');
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Could not load plans'));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !paying && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, paying]);

  const pay = async (planId: number) => {
    setPaying(true);
    setError(null);
    try {
      const { checkoutUrl } = await meApi.startRenewalPayment(planId, agreed);
      window.location.assign(checkoutUrl);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'The payment could not be started');
      setPaying(false);
    }
  };

  const current = options?.plans.find((p) => p.current);
  const lapsed = options ? new Date(options.endDate).getTime() < Date.now() : false;
  const starts = lapsed
    ? 'Starts once your payment is confirmed.'
    : options
      ? `Starts when your current plan ends, on ${formatDate(options.endDate)}.`
      : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !paying && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="renew-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-surface-dark-lighter bg-surface-dark p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="renew-title" className="text-lg font-bold text-white">
            {step === 'choose' ? 'Choose a plan' : 'Renew membership'}
          </h2>
          <button type="button" onClick={onClose} disabled={paying} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        {!options ? (
          !error && <div className="h-32 animate-pulse rounded-lg bg-white/5" />
        ) : !options.canPay ? (
          <p className="text-sm text-white/70">{options.reason}</p>
        ) : step === 'start' && current ? (
          <div className="space-y-3">
            <Agreement agreed={agreed} onChange={setAgreed} />
            <button
              type="button"
              disabled={paying || !agreed}
              onClick={() => pay(current.id)}
              className="w-full rounded-lg border border-primary bg-primary/10 p-4 text-left hover:bg-primary/20 disabled:opacity-60"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">Renew {current.name}</span>
                <span className="font-semibold tabular-nums text-white">{money(current.price)}</span>
              </span>
              <span className="mt-1 block text-sm text-white/60">
                {current.periodDays} days · {starts}
              </span>
            </button>
            {options.plans.length > 1 && (
              <button
                type="button"
                disabled={paying}
                onClick={() => setStep('choose')}
                className="w-full rounded-lg border border-white/10 p-4 text-left text-white hover:border-white/20 disabled:opacity-60"
              >
                Switch to a different plan
              </button>
            )}
            {paying && <p className="text-sm text-white/60">Opening SantimPay…</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {options.plans.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3 ${
                    chosen === p.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="plan" checked={chosen === p.id} onChange={() => setChosen(p.id)} />
                    <span>
                      <span className="text-white">{p.name}</span>
                      {p.current && <span className="ml-2 text-xs text-white/50">current</span>}
                      <span className="block text-xs text-white/50">{p.periodDays} days</span>
                    </span>
                  </span>
                  <span className="tabular-nums text-white">{money(p.price)}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-white/50">{starts}</p>
            <Agreement agreed={agreed} onChange={setAgreed} />
            <div className="flex gap-3">
              {current && (
                <button type="button" onClick={() => setStep('start')} disabled={paying} className="h-10 rounded-full border border-white/15 px-5 text-sm text-white">
                  Back
                </button>
              )}
              <button
                type="button"
                disabled={chosen == null || paying || !agreed}
                onClick={() => chosen != null && pay(chosen)}
                className="h-10 flex-1 rounded-full bg-primary px-5 text-sm text-white disabled:opacity-60"
              >
                {paying
                  ? 'Opening SantimPay…'
                  : `Pay ${money(options.plans.find((p) => p.id === chosen)?.price ?? 0)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Required before paying: SantimPay's agreement asks members to accept both (§8, §9). */
function Agreement({ agreed, onChange }: { agreed: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-white/70">
      <input type="checkbox" checked={agreed} onChange={(e) => onChange(e.target.checked)} className="mt-0.5" />
      <span>
        I agree to the{' '}
        <Link href="/terms" target="_blank" className="text-primary underline">Terms</Link> and{' '}
        <Link href="/refund-policy" target="_blank" className="text-primary underline">Refund Policy</Link>.
      </span>
    </label>
  );
}

/**
 * The outcome of a payment the member just came back from (?ref=…), or a payment
 * still waiting for the gym. Shows nothing otherwise.
 */
export function OnlinePaymentNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get('ref');
  const returned = params.get('result') ?? '';
  const [justPaid, setJustPaid] = useState<MyOnlinePayment | null>(null);
  const [waiting, setWaiting] = useState<MyOnlinePayment | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (reference) {
      // The return page is never proof of payment: the server asks SantimPay.
      meApi
        .onlinePayment(reference)
        .then(setJustPaid)
        .catch(() => setJustPaid(null));
    }
    meApi
      .onlinePayments()
      .then((all) => setWaiting(all.find((p) => p.status === 'paid') ?? null))
      .catch(() => {});
  }, [reference]);

  const clear = () => {
    setDismissed(true);
    router.replace(window.location.pathname);
  };

  if (justPaid && !dismissed && justPaid.status !== 'paid' && justPaid.status !== 'applied') {
    const unfinished = justPaid.status === 'initiated' && returned === 'success';
    return (
      <Banner tone={unfinished ? 'neutral' : 'error'} onClose={clear}>
        {unfinished
          ? 'Your payment is still being processed. Check back in a few minutes.'
          : 'The payment was not completed. You have not been charged.'}
      </Banner>
    );
  }
  const shown = waiting ?? (justPaid?.status === 'paid' ? justPaid : null);
  if (shown)
    return (
      <Banner tone="success">
        Payment of {money(shown.amount)} for {shown.plan} received. Your membership will be updated shortly.
      </Banner>
    );
  return null;
}

function Banner({ tone, children, onClose }: { tone: 'success' | 'error' | 'neutral'; children: React.ReactNode; onClose?: () => void }) {
  const styles = {
    success: 'border-green-500/30 bg-green-500/10 text-green-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    neutral: 'border-white/10 bg-white/5 text-white/70',
  }[tone];
  return (
    <div className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${styles}`} role="status">
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
