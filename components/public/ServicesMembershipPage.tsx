'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowUpRight, Plus } from 'lucide-react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import { offerings } from '@/lib/public/offerings';
import Link from 'next/link';
import './memberships.css';
import './offerings-page.css';

const orderedOfferings = ['strength-and-conditioning', 'muay-thai', 'personal-training', 'kids-karate', 'kickboxing'].map((slug) => offerings.find((service) => service.slug === slug)!);

const questions = [
  { question: 'Is Thrive a good place to start as a beginner?', answer: 'Yes. Whether you are starting fresh or returning to training, our team can help you find a starting point and explain the equipment.' },
  { question: 'Which martial arts classes can I join?', answer: 'Thrive offers Muay Thai classes with Duressa, kickboxing, and karate classes for kids. Call 091 381 4546 for class times, age groups, and enrolment details. See Prices for membership and class pricing enquiries.' },
  { question: 'Can I train early in the morning or late at night?', answer: 'Yes. Thrive is open 24 hours, every day, so you can fit your workout around your schedule.' },
];

export default function ServicesMembershipPage() {
  const router = useRouter();

  return (
    <div className="thrive-memberships-page thrive-offerings-page">
      <Navbar onJoinClick={() => router.push('/join')} />
      <main>
        <section className="tm-hero landing-container" aria-labelledby="tm-heading">
          <div className="tm-hero-copy">
            <h1 id="tm-heading">Your goals.<br />Your way <em>to train.</em></h1>
            <p>Find your training, meet your coaches, and make space for what moves you.</p>
            <div className="tm-actions"><Link href="/pricing" className="tm-button">View prices<ArrowUpRight size={19} aria-hidden="true" /></Link></div>
          </div>
        </section>

        <section id="offerings" className="tm-offerings tm-section landing-container" aria-label="Training offerings">
          <div className="tm-offering-list">
            {orderedOfferings.map((service, index) => <article key={service.slug} id={service.slug} className={`tm-offering${index === 0 ? ' to-featured' : ''}${service.slug === 'muay-thai' || service.slug === 'kickboxing' ? ' to-immersive' : ''}`}>
              <div className="tm-offering-photo"><Image src={service.photo} alt={service.alt} fill sizes={index === 0 ? '100vw' : '(max-width: 699px) 100vw, 50vw'} /><span className="to-photo-index" aria-hidden="true">0{index + 1}</span>{index === 0 && <h3>{service.title}</h3>}</div>
              <div className="tm-offering-copy">{index !== 0 && <h3>{service.title}</h3>}<p>{service.summary}</p><ul>{service.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><Link href={service.href} className="tm-text-link">{service.prompt}<span><ArrowUpRight size={19} aria-hidden="true" /></span></Link></div>
            </article>)}
          </div>
        </section>

        <section className="tm-everyday tm-section landing-container" aria-labelledby="tm-everyday-heading">
          <h2 id="tm-everyday-heading">The Thrive<br /><em>everyday.</em></h2>
          <div className="tm-benefits">
            <article><span>24/7</span><h3>On your schedule.</h3><p>Early starts or late finishes. Our doors are open every day.</p></article>
            <article><span>All in.</span><h3>Equipment in abundance.</h3><p>Machines, free weights, and cardio. Room to make it your own.</p></article>
            <article><span>You first.</span><h3>People in your corner.</h3><p>A welcoming space and a team to help you find your way.</p></article>
          </div>
        </section>

        <section id="offerings-faq" className="tm-faq tm-section landing-container" aria-labelledby="tm-faq-heading">
          <h2 id="tm-faq-heading">A little clarity.<br /><em>Before you begin.</em></h2>
          <div className="tm-questions">{questions.map((item) => <details key={item.question}><summary>{item.question}<Plus size={19} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
        </section>

        <section className="tm-closing landing-container" aria-labelledby="tm-closing-heading"><div><h2 id="tm-closing-heading">Your next chapter<br /><em>starts with you.</em></h2><button type="button" onClick={() => router.push('/join')} className="tm-button">Join Now<ArrowUpRight size={19} aria-hidden="true" /></button></div><div className="tm-closing-contact"><span>Let&apos;s talk about your goals.</span><a href="tel:+251913814546">091 381 4546<ArrowUpRight size={24} aria-hidden="true" /></a><p>Cheers meskelegna / Ayat Noah<br />Addis Ababa, Ethiopia</p></div></section>
      </main>
      <SiteFooter onJoinClick={() => router.push('/join')} />
    </div>
  );
}


