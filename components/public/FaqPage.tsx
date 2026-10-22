'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import { faqContent, type FaqCategory } from '@/lib/faq-content';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';
import './memberships.css';
import './faq-page.css';

const categories: { id: 'all' | FaqCategory; label: string }[] = [
  { id: 'all', label: 'All questions' },
  { id: 'membership', label: 'Membership' },
  { id: 'payments', label: 'Payments' },
  { id: 'timings', label: 'Hours & location' },
  { id: 'trainers', label: 'Training' },
];

export default function FaqPage() {
  const router = useRouter();
  const [category, setCategory] = useState<'all' | FaqCategory>('all');
  const items = category === 'all' ? faqContent : faqContent.filter((item) => item.category === category);
  const join = () => router.push('/join');

  return (
    <div className="thrive-memberships-page thrive-faq-page">
      <Navbar onJoinClick={join} />
      <main className="landing-container">
        <header className="tm-pricing-intro"><div><h1>Questions?<br /><em>Let’s clear them up.</em></h1><p>Memberships, payments, training and your first visit.</p></div></header>
        <div className="tf-categories" aria-label="Filter questions">
          {categories.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
        </div>
        <section className="tm-questions tf-questions" aria-label="Frequently asked questions">
          {items.map((item) => <details key={item.id}><summary>{item.question}<Plus size={19} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}
        </section>
        <section className="tm-closing"><div><h2>Still have<br /><em>a question?</em></h2><a className="tm-button" href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}</a></div><div className="tm-closing-contact"><p>Our team can help you choose your next step.</p></div></section>
      </main>
      <SiteFooter onJoinClick={join} />
    </div>
  );
}
