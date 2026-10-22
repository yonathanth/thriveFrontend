'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CreditCard, X } from 'lucide-react';
import Navbar from './Navbar';
import BrandLogo from './BrandLogo';
import { membershipPeriods, membershipTypes } from '@/lib/public/memberships';
import { classPricing, formatBirr } from '@/lib/public/pricing';
import { offerings } from '@/lib/public/offerings';
import './join-page.css';

const choices = [
  { slug: 'gym', title: 'Gym membership' },
  ...classPricing.map((item) => ({ slug: item.slug, title: offerings.find((offering) => offering.slug === item.slug)!.title })),
];
type Access = keyof typeof membershipTypes;
type PaymentState = 'closed' | 'ready' | 'complete' | 'failed';

export default function JoinPage() {
  const params = useSearchParams();
  const [selected, setSelected] = useState(() => choices.some((choice) => choice.slug === params.get('offering')) ? params.get('offering')! : 'gym');
  const [access, setAccess] = useState<Access>(() => params.get('access') === 'happyHour' ? 'happyHour' : 'standard');
  const [period, setPeriod] = useState(() => membershipPeriods.some((plan) => plan.months === params.get('period')) ? params.get('period')! : '01');
  const [details, setDetails] = useState({ name: '', phone: '' });
  const [payment, setPayment] = useState<PaymentState>('closed');
  const heading = useRef<HTMLHeadingElement>(null);
  const selection = choices.find((choice) => choice.slug === selected)!;
  const plan = membershipPeriods.find((item) => item.months === period)!;
  const session = classPricing.find((item) => item.slug === selected);
  const amount = selected === 'gym' ? plan.prices[access] : session!.price;
  const duration = selected === 'gym' ? plan.description : session!.unit.replace('per ', '1 ');

  function showPayment(state: PaymentState) {
    setPayment(state);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  }
  function continueToPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    showPayment('ready');
  }

  return (
    <div className="thrive-join-page">
      <Navbar onJoinClick={() => showPayment('closed')} />
      <main className="landing-container">
        <header className="tj-intro"><h1>Join <em>Thrive.</em></h1><p>Choose your training. Get started.</p></header>
        <div className="tj-layout">
          <section className="tj-workspace" aria-labelledby="tj-step-title">
            <h2 ref={heading} tabIndex={-1} id="tj-step-title">{payment === 'closed' ? 'Your training.' : 'Payment preview.'}</h2>
            {payment === 'closed' ? <form id="join-selection" className="tj-form" onSubmit={continueToPayment}>
              <label className="tj-field">Offering<select value={selected} onChange={(event) => setSelected(event.target.value)}>{choices.map((choice) => <option key={choice.slug} value={choice.slug}>{choice.title}</option>)}</select></label>
              {selected === 'gym' ? <div className="tj-package-fields">
                <fieldset><legend>Access</legend><div className="tj-access">{(Object.keys(membershipTypes) as Access[]).map((type) => <label key={type}><input type="radio" name="access" checked={access === type} onChange={() => setAccess(type)} /><span>{membershipTypes[type].label}</span></label>)}</div><p className="tj-access-note">{access === 'standard' ? '24/7 gym access' : 'Off-peak gym access'}</p></fieldset>
                <label className="tj-field">Duration<select value={period} onChange={(event) => setPeriod(event.target.value)}>{membershipPeriods.map((item) => <option key={item.months} value={item.months}>{item.name}</option>)}</select></label>
              </div> : <p className="tj-session">{session!.coach} · {session!.days}<br />{session!.time}</p>}
              <div className="tj-contact-fields"><label className="tj-field">{selected === 'kids-karate' ? 'Parent / guardian name' : 'Your name'}<input name="name" autoComplete="name" placeholder="Full name" required maxLength={100} value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} /></label><label className="tj-field">Mobile number<input name="phone" type="tel" autoComplete="tel" placeholder="09… or +251…" required pattern="[+0-9 .]{7,25}" maxLength={25} value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} /></label></div>
            </form> : <div key={payment} className="tj-payment" aria-live="polite">
              <div className="tj-payment-top"><strong>SantimPay</strong><span>Demo checkout</span></div>
              {payment === 'ready' && <><CreditCard className="tj-payment-icon" size={37} aria-hidden="true" /><h3>{formatBirr(amount)} birr</h3><p>{selection.title} · {duration}</p><div className="tj-payment-note">Payment preview only. No money will be charged.</div><button type="button" className="tj-primary" onClick={() => showPayment('complete')}>Preview successful payment<ArrowRight size={18} aria-hidden="true" /></button><button type="button" className="tj-test-failure" onClick={() => showPayment('failed')}>Preview unsuccessful payment</button></>}
              {payment === 'complete' && <><Check className="tj-payment-icon" size={40} aria-hidden="true" /><h3>Preview complete.</h3><p>No payment taken. Membership not activated.</p><Link className="tj-primary" href="/contact">Contact Thrive<ArrowUpRight size={18} aria-hidden="true" /></Link></>}
              {payment === 'failed' && <><X className="tj-payment-icon" size={40} aria-hidden="true" /><h3>Payment unsuccessful.</h3><p>Your selection is saved on this screen.</p><button type="button" className="tj-primary" onClick={() => showPayment('ready')}>Try again<ArrowRight size={18} aria-hidden="true" /></button></>}
              <button type="button" className="tj-back" onClick={() => showPayment('closed')}><ArrowLeft size={16} aria-hidden="true" />Back to selection</button>
            </div>}
          </section>
          <aside className="tj-summary" aria-label="Your selection"><span>Your selection</span><h2>{selection.title}</h2><p>{selected === 'gym' ? `${membershipTypes[access].label} · ${plan.description}` : `${duration} · ${session!.coach}`}</p><div className="tj-total"><span>Total</span><strong key={amount}>{formatBirr(amount)}<small> birr</small></strong></div>{payment === 'closed' && <><button type="submit" form="join-selection" className="tj-primary">Continue to payment<ArrowUpRight size={18} aria-hidden="true" /></button><p className="tj-demo-note">SantimPay preview · No charge</p></>}<div className="tj-help"><span>Need help?</span><a href="tel:+251913814546">091 381 4546<ArrowUpRight size={17} aria-hidden="true" /></a></div></aside>
        </div>
      </main>
      <footer className="tj-footer landing-container"><Link href="/pricing"><ArrowLeft size={16} aria-hidden="true" />Back to prices</Link><BrandLogo className="thrive-logo--small" /></footer>
    </div>
  );
}
