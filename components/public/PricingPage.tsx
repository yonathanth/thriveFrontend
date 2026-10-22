'use client';

import { useRouter } from 'next/navigation';
import { ArrowUpRight, Plus } from 'lucide-react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import MembershipSection from './MembershipSection';
import { offerings } from '@/lib/public/offerings';
import { classPricing, formatBirr } from '@/lib/public/pricing';
import './memberships.css';

const pricedServices = classPricing.map((pricing) => ({ ...offerings.find((service) => service.slug === pricing.slug)!, pricing }));
const questions = [
  { question: 'Which membership periods can I choose?', answer: 'Standard and Happy Hour memberships are available for one month, three months, six months, or a year. Each displayed price covers the full period. Prices on this preview are placeholders.' },
  { question: 'When can I train with Happy Hour?', answer: 'Happy Hour gives you access during designated quieter, off-peak hours. Confirm the exact access timetable with our team before choosing your package.' },
  { question: 'Are classes and personal training included?', answer: 'Please confirm coaching and class inclusions with our team. Muay Thai, kickboxing, kids’ karate, and personal training pricing enquiries are listed separately so you can ask about the training you want.' },
  { question: 'How do payments, renewals, and membership pauses work?', answer: 'Our team can explain payment options, any joining fees, and the renewal, pause, or change terms for your chosen package. Confirm the details before joining.' },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="thrive-memberships-page tm-pricing-page">
      <Navbar onJoinClick={() => router.push('/join')} />
      <main>
        <header className="tm-pricing-intro landing-container"><div><h1 id="pricing-heading">Find your <em>fit.</em></h1><p>Gym memberships, classes, and one-to-one coaching.</p></div></header>

        <MembershipSection />

        <section id="class-prices" className="tm-section landing-container" aria-labelledby="class-prices-heading">
          <div className="tm-section-heading"><h2 id="class-prices-heading">Classes <em>& coaching.</em></h2><p>Find your session. Meet your coach.</p></div>
          <div className="tm-class-prices">{pricedServices.map((service) => <article id={service.slug} key={service.slug} className={`tm-class-price tm-class-${service.slug}`}>
            <div className="tm-class-price-copy"><h3>{service.title}</h3><div className="tm-class-amount"><strong>{formatBirr(service.pricing.price)} <span>birr</span></strong><span>{service.pricing.unit}</span></div><dl className="tm-class-schedule"><div><dt>Coach</dt><dd>{service.pricing.coach}</dd></div><div><dt>Days</dt><dd>{service.pricing.days}</dd></div><div><dt>Time</dt><dd>{service.pricing.time}</dd></div><div><dt>Starts</dt><dd>{service.pricing.starts}</dd></div></dl><button type="button" onClick={() => router.push(`/join?offering=${service.slug}`)} className="tm-plan-action" aria-label={`Join ${service.title.toLowerCase()}`}>{service.slug === 'personal-training' ? 'Book a session' : 'Join class'}<ArrowUpRight size={18} aria-hidden="true" /></button></div>
          </article>)}</div>
        </section>

        <section className="tm-faq tm-section landing-container" aria-labelledby="pricing-faq-heading"><h2 id="pricing-faq-heading">Clear choices.<br /><em>No guesswork.</em></h2><div className="tm-questions">{questions.map((item) => <details key={item.question}><summary>{item.question}<Plus size={19} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div></section>

        <section className="tm-closing landing-container" aria-labelledby="pricing-closing-heading"><div><h2 id="pricing-closing-heading">Let&apos;s find<br /><em>your starting point.</em></h2><button type="button" onClick={() => router.push('/join')} className="tm-button">Join Now<ArrowUpRight size={19} aria-hidden="true" /></button></div><div className="tm-closing-contact"><span>Need help choosing? Give us a call.</span><a href="tel:+251913814546">091 381 4546<ArrowUpRight size={24} aria-hidden="true" /></a><p>Cheers meskelegna / Ayat Noah<br />Addis Ababa, Ethiopia</p></div></section>
      </main>
      <SiteFooter onJoinClick={() => router.push('/join')} />
    </div>
  );
}


