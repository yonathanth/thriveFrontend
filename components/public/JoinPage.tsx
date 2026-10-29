'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check, Clock, CreditCard, X } from 'lucide-react';
import Navbar from './Navbar';
import BrandLogo from './BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, publicJoinApi, type JoinPaymentStatus } from '@/lib/api';
import { findPlan, formatBirr, formatPeriod, type PricingSection } from '@/lib/public/packages';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';
import './join-page.css';

/** Ethiopian mobile numbers, written 09…, 07…, +2519… or 2519…, spaces allowed. */
const MOBILE = /^(?:\+?251|0)?[79]\d{8}$/;

type Done = { kind: 'registered'; plan: string } | null;

export default function JoinPage({ sections, payOnline }: { sections: PricingSection[]; payOnline: boolean }) {
  const params = useSearchParams();
  const reference = params.get('ref');
  if (reference) return <Frame><PaymentResult reference={reference} returned={params.get('result') ?? ''} /></Frame>;
  return <Frame><JoinForm sections={sections} payOnline={payOnline} initialPlan={Number(params.get('plan')) || null} /></Frame>;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="thrive-join-page">
      <Navbar />
      <main className="landing-container">
        <header className="tj-intro"><h1>Join <em>Thrive.</em></h1><p>Choose your membership. Get started.</p></header>
        {children}
      </main>
      <footer className="tj-footer landing-container"><Link href="/pricing"><ArrowLeft size={16} aria-hidden="true" />Back to prices</Link><BrandLogo className="thrive-logo--small" /></footer>
    </div>
  );
}

function JoinForm({ sections, payOnline, initialPlan }: { sections: PricingSection[]; payOnline: boolean; initialPlan: number | null }) {
  const { user } = useAuth();
  const packages = useMemo(() => sections.flatMap((s) => s.packages.map((pkg) => ({ section: s.label, pkg }))), [sections]);
  const start = (initialPlan != null ? findPlan(sections, initialPlan) : null) ?? (packages[0] ? { pkg: packages[0].pkg, plan: packages[0].pkg.plans[0] } : null);
  const [pkgId, setPkgId] = useState(start?.pkg.id ?? '');
  const [planId, setPlanId] = useState(start?.plan.id ?? 0);
  const [details, setDetails] = useState({ name: '', phone: '', email: '' });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const pkg = packages.find((p) => p.pkg.id === pkgId)?.pkg ?? packages[0]?.pkg;
  const plan = pkg?.plans.find((p) => p.id === planId) ?? pkg?.plans[0];
  // Couple and group plans register everyone together at the desk.
  const online = payOnline && !!pkg && !pkg.group;
  const [mode, setMode] = useState<'online' | 'desk'>(online ? 'online' : 'desk');
  // A package that cannot be paid online always goes to the desk, whatever was picked.
  const paying = online && mode === 'online';

  if (!pkg || !plan) {
    return (
      <section className="tj-workspace">
        <h2>Prices are on their way.</h2>
        <p className="tj-lead">We could not load the plans just now. Call <a href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}</a> and we will sign you up.</p>
      </section>
    );
  }

  const choosePackage = (id: string) => {
    const next = packages.find((p) => p.pkg.id === id)?.pkg;
    if (!next) return;
    setPkgId(id);
    // Keep the same length where the new package has it.
    setPlanId((next.plans.find((p) => p.periodDays === plan.periodDays) ?? next.plans[0]).id);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const phone = details.phone.replace(/[\s.-]/g, '');
    if (!MOBILE.test(phone)) {
      setError('Please enter an Ethiopian mobile number, like 09… or +2519….');
      return;
    }
    if (paying && !agreed) {
      setError('Please accept the Terms and Refund Policy to pay online.');
      return;
    }
    setBusy(true);
    const person = { fullName: details.name.trim(), phoneNumber: phone, email: details.email.trim() || undefined };
    try {
      if (paying) {
        const { checkoutUrl } = await publicJoinApi.startPayment({ ...person, serviceLocalId: plan.id, acceptedTerms: true });
        window.location.assign(checkoutUrl);
        return;
      }
      await publicJoinApi.register({
        ...person,
        serviceId: plan.id,
        notes: `Chose ${plan.name} (${formatBirr(plan.price)} birr) on the website; will pay at the front desk.`,
      });
      setDone({ kind: 'registered', plan: `${pkg.name} · ${formatPeriod(plan.periodDays)}` });
      requestAnimationFrame(() => heading.current?.focus());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="tj-layout tj-layout-single">
        <section className="tj-workspace tj-result" aria-live="polite">
          <Check className="tj-payment-icon" size={40} aria-hidden="true" />
          <h2 ref={heading} tabIndex={-1}>We&apos;ve got your details.</h2>
          <p>{done.plan}. The front desk will call you on {details.phone} to finish joining. You can also come in any time: we are open 24/7.</p>
          <a className="tj-primary" href={`tel:${PHONE_E164}`}>Call {PHONE_DISPLAY}<ArrowUpRight size={18} aria-hidden="true" /></a>
        </section>
      </div>
    );
  }

  return (
    <>
      {user?.role === 'member' && (
        <div className="tj-banner" role="status">
          <span>You&apos;re signed in as a member. Renewing? Do it from your account so it carries on from your current plan.</span>
          <Link href="/member">Go to my membership<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      )}
      <div className="tj-layout">
        <section className="tj-workspace" aria-labelledby="tj-step-title">
          <h2 ref={heading} tabIndex={-1} id="tj-step-title">Your membership.</h2>
          <form id="join-form" className="tj-form" onSubmit={submit}>
            <label className="tj-field">Package
              <select value={pkg.id} onChange={(e) => choosePackage(e.target.value)}>
                {sections.map((s) => (
                  <optgroup key={s.id} label={s.label}>
                    {s.packages.map((p) => <option key={p.id} value={p.id}>{p.name}{p.group ? ' (couple / group)' : ''}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            {pkg.benefits.length > 0 && <p className="tj-benefits">{pkg.benefits.join(' · ')}</p>}

            <fieldset>
              <legend>How long</legend>
              <div className="tj-lengths">
                {pkg.plans.map((p) => (
                  <label key={p.id}>
                    <input type="radio" name="plan" checked={p.id === plan.id} onChange={() => setPlanId(p.id)} />
                    <span>{formatPeriod(p.periodDays)}</span>
                    <small>{formatBirr(p.price)} birr</small>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="tj-contact-fields">
              <label className="tj-field">Your name<input name="name" autoComplete="name" placeholder="Full name" required minLength={2} maxLength={100} value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} /></label>
              <label className="tj-field">Mobile number<input name="phone" type="tel" autoComplete="tel" placeholder="09… or +251…" required maxLength={20} value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} /></label>
              <label className="tj-field tj-field-wide">Email <span className="tj-optional">(optional)</span><input name="email" type="email" autoComplete="email" maxLength={255} value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} /></label>
            </div>

            <fieldset>
              <legend>How you&apos;ll pay</legend>
              <div className="tj-paymodes">
                <label className={!online ? 'is-disabled' : undefined}>
                  <input type="radio" name="mode" checked={paying} disabled={!online} onChange={() => setMode('online')} />
                  <span><strong>Pay online now</strong><small>{online ? 'Telebirr, CBE Birr or your bank, through SantimPay' : pkg.group ? 'Couple and group packages are paid at the front desk' : 'Not available right now'}</small></span>
                </label>
                <label>
                  <input type="radio" name="mode" checked={!paying} onChange={() => setMode('desk')} />
                  <span><strong>Pay at the front desk</strong><small>Leave your details and we&apos;ll call you</small></span>
                </label>
              </div>
            </fieldset>

            {paying && (
              <label className="tj-check">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I agree to the <Link href="/terms" target="_blank">Terms</Link> and <Link href="/refund-policy" target="_blank">Refund Policy</Link>.</span>
              </label>
            )}
            {error && <p className="tj-error" role="alert">{error}</p>}
          </form>
        </section>

        <aside className="tj-summary" aria-label="Your selection">
          <span>Your selection</span>
          <h2>{pkg.name}</h2>
          <p>{formatPeriod(plan.periodDays)}{pkg.group && pkg.groupSize ? ` · for ${pkg.groupSize} people` : ''}</p>
          <div className="tj-total"><span>Total</span><strong key={plan.id}>{formatBirr(plan.price)}<small> birr</small></strong></div>
          <button type="submit" form="join-form" className="tj-primary" disabled={busy || (paying && !agreed)}>
            {busy ? (paying ? 'Opening SantimPay…' : 'Sending…') : paying ? <>Pay {formatBirr(plan.price)} birr<CreditCard size={18} aria-hidden="true" /></> : <>Send my details<ArrowUpRight size={18} aria-hidden="true" /></>}
          </button>
          <p className="tj-demo-note">{paying ? 'Your membership starts once the gym confirms the payment, usually the same day.' : 'No payment now. We will call you to finish joining.'}</p>
          <div className="tj-help"><span>Need help?</span><a href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}<ArrowUpRight size={17} aria-hidden="true" /></a></div>
        </aside>
      </div>
    </>
  );
}

/** Back from SantimPay. The return address proves nothing: the server asks SantimPay. */
function PaymentResult({ reference, returned }: { reference: string; returned: string }) {
  const router = useRouter();
  const [payment, setPayment] = useState<JoinPaymentStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const check = () => {
      publicJoinApi
        .payment(reference)
        .then((p) => {
          if (stopped) return;
          setPayment(p);
          // SantimPay can take a moment to settle after sending the payer back.
          if (p.status === 'initiated' && returned === 'success' && ++tries < 8) timer = setTimeout(check, 4000);
        })
        .catch(() => !stopped && setFailed(true));
    };
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reference, returned]);

  const tryAgain = () => router.replace('/join');
  const status = payment?.status;
  const paid = status === 'paid' || status === 'applied';

  return (
    <div className="tj-layout tj-layout-single">
      <section className="tj-workspace tj-result" aria-live="polite">
        {failed ? (
          <>
            <X className="tj-payment-icon" size={40} aria-hidden="true" />
            <h2>We couldn&apos;t check this payment.</h2>
            <p>If money left your account, call us and quote reference {reference.slice(0, 8)}.</p>
            <a className="tj-primary" href={`tel:${PHONE_E164}`}>Call {PHONE_DISPLAY}<ArrowUpRight size={18} aria-hidden="true" /></a>
          </>
        ) : !payment ? (
          <div className="tj-loading" aria-label="Checking your payment" />
        ) : paid ? (
          <>
            <Check className="tj-payment-icon" size={40} aria-hidden="true" />
            <h2>Payment received. Welcome to Thrive.</h2>
            <p>{formatBirr(payment.amount)} birr for {payment.plan}{payment.paidVia ? ` via ${payment.paidVia}` : ''}. {status === 'applied' ? 'Your membership is active.' : 'The front desk will confirm your membership shortly and call you.'} On your first visit we&apos;ll register your fingerprint for the door.</p>
            <Link className="tj-primary" href="/login">Sign in to your account<ArrowUpRight size={18} aria-hidden="true" /></Link>
          </>
        ) : status === 'initiated' ? (
          <>
            <Clock className="tj-payment-icon" size={40} aria-hidden="true" />
            <h2>Still processing.</h2>
            <p>{returned === 'success' ? 'SantimPay is still confirming your payment. This page will update; you can also check back in a few minutes.' : 'This payment was not finished. You have not been charged.'}</p>
            <button type="button" className="tj-primary" onClick={tryAgain}>Start again<ArrowUpRight size={18} aria-hidden="true" /></button>
          </>
        ) : status === 'rejected' || status === 'refunded' ? (
          <>
            <X className="tj-payment-icon" size={40} aria-hidden="true" />
            <h2>This payment was not accepted.</h2>
            <p>{status === 'refunded' ? 'It has been refunded.' : 'It is being refunded.'} Call us and we will sort out your membership.</p>
            <a className="tj-primary" href={`tel:${PHONE_E164}`}>Call {PHONE_DISPLAY}<ArrowUpRight size={18} aria-hidden="true" /></a>
          </>
        ) : (
          <>
            <X className="tj-payment-icon" size={40} aria-hidden="true" />
            <h2>Payment not completed.</h2>
            <p>You have not been charged. You can try again, or pay at the front desk.</p>
            <button type="button" className="tj-primary" onClick={tryAgain}>Try again<ArrowUpRight size={18} aria-hidden="true" /></button>
          </>
        )}
      </section>
    </div>
  );
}
