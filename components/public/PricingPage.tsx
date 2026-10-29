'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, Plus, Users } from 'lucide-react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import { useAuth } from '@/contexts/AuthContext';
import { RenewModal } from '@/components/portal/RenewMembership';
import { DAY_NAMES, formatTime, type CatalogAddon, type CatalogClass, type CatalogPlan } from '@/lib/catalog';
import { formatBirr, formatPeriod, perMonth, type Package, type PricingSection } from '@/lib/public/packages';
import { BUSINESS_CITY, BUSINESS_LOCATION_LINE, PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';
import './memberships.css';
import './pricing.css';

const questions = [
  { question: 'How do I join?', answer: 'Pick a package and how long, then press Join now. You can pay online with Telebirr, CBE Birr or your bank through SantimPay, or leave your details and pay at the front desk. The gym confirms your membership and you are ready to train.' },
  { question: 'When does my membership start?', answer: 'A membership paid online starts on the day the gym confirms it, usually the same day. Come in to register your fingerprint for the door.' },
  { question: 'I am already a member. How do I renew?', answer: 'Sign in and renew from your account, or press Renew with this plan on any package here. If your plan is still running, the new one starts when it ends.' },
  { question: 'How do couple and group packages work?', answer: 'Everyone on a couple or group package is registered together at the front desk. Leave your details and we will call you to set it up.' },
];

interface Props {
  sections: PricingSection[];
  addons: CatalogAddon[];
  classes: CatalogClass[];
}

export default function PricingPage({ sections, addons, classes }: Props) {
  const router = useRouter();
  const [renewPlan, setRenewPlan] = useState<number | null>(null);

  // Individual packages stay in their section; couple and group ones get their own.
  const individual = useMemo(
    () => sections.map((s) => ({ ...s, packages: s.packages.filter((p) => !p.group) })).filter((s) => s.packages.length > 0),
    [sections],
  );
  const groups = useMemo(() => sections.flatMap((s) => s.packages.filter((p) => p.group)), [sections]);
  const addonsShown = addons.filter((a) => a.isFree || a.price > 0 || a.variants.some((v) => v.price > 0));

  const nav = [
    ...individual.map((s) => ({ id: s.id, label: s.label })),
    ...(groups.length ? [{ id: 'groups', label: 'Couples & groups' }] : []),
    ...(addonsShown.length ? [{ id: 'add-ons', label: 'Add-ons' }] : []),
    ...(classes.length ? [{ id: 'class-prices', label: 'Timetable' }] : []),
    { id: 'questions', label: 'Questions' },
  ];
  const active = useActiveSection(nav.map((n) => n.id));

  return (
    <div className="thrive-memberships-page tm-pricing-page">
      <Navbar onJoinClick={() => router.push('/join')} />
      <main>
        <header className="tm-pricing-intro landing-container">
          <div>
            <h1 id="pricing-heading">Find your <em>fit.</em></h1>
            <p>Every package and price, straight from the front desk. Join online in a minute.</p>
          </div>
        </header>

        <nav className="tp-nav" aria-label="Price sections">
          <div className="landing-container tp-nav-inner">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}>{n.label}</a>
            ))}
          </div>
        </nav>

        {individual.length === 0 && (
          <section className="tm-section landing-container tp-empty">
            <h2>Prices are <em>on their way.</em></h2>
            <p>We could not load the price list just now. Call <a href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}</a> and we will help you choose.</p>
          </section>
        )}

        {individual.map((section) => (
          <PackageSection key={section.id} id={section.id} title={section.label} intro={section.intro} packages={section.packages} onRenew={setRenewPlan} />
        ))}

        {groups.length > 0 && (
          <PackageSection
            id="groups"
            title="Couples & groups"
            intro="Train together. Everyone is registered at the front desk, so leave your details and we will call you."
            packages={groups}
            onRenew={setRenewPlan}
          />
        )}

        {addonsShown.length > 0 && (
          <section id="add-ons" className="tm-section landing-container tp-section" aria-labelledby="add-ons-heading">
            <div className="tp-section-heading"><h2 id="add-ons-heading">Add-<em>ons.</em></h2><p>Extras on top of a membership, added at the front desk.</p></div>
            <div className="tp-addons">
              {addonsShown.map((a) => (
                <article key={a.id} className="tp-addon">
                  <h3>{a.name}</h3>
                  {a.description && <p>{a.description}</p>}
                  <ul>
                    {a.isFree ? <li><span>Included</span><strong>Free</strong></li>
                      : a.variants.length ? a.variants.map((v) => <li key={v.name}><span>{formatPeriod(v.periodDays)}</span><strong>{formatBirr(v.price)} birr</strong></li>)
                        : <li><span>Price</span><strong>{formatBirr(a.price)} birr</strong></li>}
                  </ul>
                  <a href={`tel:${PHONE_E164}`} className="tp-addon-link">Add at the desk<ArrowUpRight size={16} aria-hidden="true" /></a>
                </article>
              ))}
            </div>
          </section>
        )}

        {classes.length > 0 && (
          <section id="class-prices" className="tm-section landing-container tp-section" aria-labelledby="timetable-heading">
            <div className="tp-section-heading"><h2 id="timetable-heading">Weekly <em>timetable.</em></h2><p>Times in Addis Ababa. The floor stays open around the clock.</p></div>
            <Timetable classes={classes} />
          </section>
        )}

        <section id="questions" className="tm-faq tm-section landing-container" aria-labelledby="pricing-faq-heading">
          <h2 id="pricing-faq-heading">Clear choices.<br /><em>No guesswork.</em></h2>
          <div className="tm-questions">{questions.map((item) => <details key={item.question}><summary>{item.question}<Plus size={19} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
        </section>

        <section className="tm-closing landing-container" aria-labelledby="pricing-closing-heading">
          <div><h2 id="pricing-closing-heading">Let&apos;s find<br /><em>your starting point.</em></h2><button type="button" onClick={() => router.push('/join')} className="tm-button">Join Now<ArrowUpRight size={19} aria-hidden="true" /></button></div>
          <div className="tm-closing-contact"><span>Need help choosing? Give us a call.</span><a href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}<ArrowUpRight size={24} aria-hidden="true" /></a><p>{BUSINESS_LOCATION_LINE}<br />{BUSINESS_CITY}, Ethiopia</p></div>
        </section>
      </main>
      <SiteFooter onJoinClick={() => router.push('/join')} />
      {renewPlan != null && <RenewModal initialPlanId={renewPlan} onClose={() => setRenewPlan(null)} />}
    </div>
  );
}

/** One section: a switch between its packages, then a card per length. */
function PackageSection({ id, title, intro, packages, onRenew }: { id: string; title: string; intro: string; packages: Package[]; onRenew: (planId: number) => void }) {
  const [selected, setSelected] = useState(packages[0].id);
  const pkg = packages.find((p) => p.id === selected) ?? packages[0];

  // A link to a package (/pricing#full-package) opens on it.
  useEffect(() => {
    const open = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!packages.some((p) => p.id === hash)) return;
      setSelected(hash);
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, [id, packages]);

  const [head, ...rest] = title.split(' ');
  return (
    <section id={id} className="tm-plans tm-section tp-section" aria-labelledby={`${id}-heading`}>
      <div className="landing-container">
        <div className="tp-section-heading">
          <h2 id={`${id}-heading`}>{head} <em>{rest.join(' ') || ''}</em></h2>
          <p>{intro}</p>
        </div>
        {packages.length > 1 && (
          <div className="tm-membership-selector tp-switch" role="group" aria-label={`${title} packages`}>
            {packages.map((p) => (
              <button type="button" key={p.id} aria-pressed={p.id === pkg.id} aria-controls={`${id}-plans`} onClick={() => setSelected(p.id)}>{p.name}</button>
            ))}
          </div>
        )}
        <div className="tp-package-summary" aria-live="polite">
          <h3>{pkg.name}</h3>
          {pkg.group && <span className="tp-badge"><Users size={14} aria-hidden="true" />{pkg.groupSize ? `For ${pkg.groupSize} people` : 'For two or more'}</span>}
          {pkg.benefits.length > 0 && (
            <ul className="tp-benefits">{pkg.benefits.map((b) => <li key={b}><Check size={15} aria-hidden="true" />{b}</li>)}</ul>
          )}
        </div>
        <div id={`${id}-plans`} className={`tm-plan-grid tp-plan-grid tp-count-${Math.min(pkg.plans.length, 5)}`}>
          {pkg.plans.map((plan) => <PlanCard key={plan.id} plan={plan} pkg={pkg} onRenew={onRenew} />)}
        </div>
        <p className="tm-plan-help">Not sure which? <a href={`tel:${PHONE_E164}`}>Call {PHONE_DISPLAY}<ArrowUpRight size={14} aria-hidden="true" /></a></p>
      </div>
    </section>
  );
}

function PlanCard({ plan, pkg, onRenew }: { plan: CatalogPlan; pkg: Package; onRenew: (planId: number) => void }) {
  const { user } = useAuth();
  const member = user?.role === 'member';
  const monthly = perMonth(plan);
  const label = `${formatPeriod(plan.periodDays)} ${pkg.name.toLowerCase()}`;
  return (
    <article className="tm-plan tp-plan">
      <h3>{formatPeriod(plan.periodDays)}</h3>
      <div className="tm-plan-amount">
        <strong>{formatBirr(plan.price)}</strong>
        <span>birr <span>/ {formatPeriod(plan.periodDays)}</span></span>
      </div>
      <p className="tp-plan-note">{monthly ?? (plan.maxUsageCount ? `${plan.maxUsageCount} visits` : 'Billed once for the period')}</p>
      {member && !pkg.group ? (
        <button type="button" className="tm-plan-action" onClick={() => onRenew(plan.id)} aria-label={`Renew with ${label}`}>
          Renew with this plan<ArrowUpRight size={18} aria-hidden="true" />
        </button>
      ) : (
        <Link href={`/join?plan=${plan.id}`} className="tm-plan-action" aria-label={`${pkg.group ? 'Join together on' : 'Join with'} ${label}`}>
          {pkg.group ? 'Join together' : 'Join now'}<ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}

/** The weekly classes, one day at a time, opening on today in Addis Ababa. */
function Timetable({ classes }: { classes: CatalogClass[] }) {
  const days = useMemo(() => [...new Set(classes.map((c) => c.dayOfWeek))].sort(), [classes]);
  const [day, setDay] = useState(days[0] ?? 1);
  useEffect(() => {
    const name = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Africa/Addis_Ababa' }).format(new Date());
    const today = DAY_NAMES.indexOf(name as (typeof DAY_NAMES)[number]) + 1;
    // Monday for the server render, then today once in the browser.
    const id = setTimeout(() => days.includes(today) && setDay(today), 0);
    return () => clearTimeout(id);
  }, [days]);
  const items = classes.filter((c) => c.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  return (
    <div className="tp-timetable">
      <div className="tm-membership-selector tp-switch" role="group" aria-label="Day">
        {DAY_NAMES.map((name, i) => days.includes(i + 1) && (
          <button key={name} type="button" aria-pressed={day === i + 1} onClick={() => setDay(i + 1)}>{name.slice(0, 3)}</button>
        ))}
      </div>
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            <span className="tp-time">{formatTime(c.startTime)} – {formatTime(c.endTime)}</span>
            <strong>{c.title}</strong>
            <span className="tp-who">{[c.trainer, c.room].filter(Boolean).join(' · ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The section in view, for highlighting it in the section bar. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');
  useEffect(() => {
    const els = key.split('|').map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        const top = els.find((el) => (visible.get(el.id) ?? 0) > 0);
        setActive(top?.id ?? null);
      },
      { rootMargin: '-140px 0px -45% 0px', threshold: [0, 0.01, 0.25] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);
  return active;
}
