'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import FacilitiesSection from './FacilitiesSection';
import TourVideoModal from './TourVideoModal';
import './about-page.css';

export default function AboutPage() {
  const router = useRouter();
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <div className="thrive-story-page">
      <Navbar onJoinClick={() => router.push('/join')} />
      <main>
        <section className="ts-intro landing-container" aria-labelledby="story-title">
          <div className="ts-intro-heading"><h1 id="story-title">New space.<br /><em>Deep roots.</em></h1><div><p>A fresh home for fitness in Addis.<br />Built on years of living it.</p><Link href="/pricing">See prices<ArrowUpRight size={17} aria-hidden="true" /></Link></div></div>
          <div className="ts-cover"><Image src="/tour-thumbnail.jpg" alt="An expansive gym floor filled with strength equipment and people training" fill priority sizes="100vw" /><span className="ts-cover-shade" /><span className="ts-cover-caption">More room for<br /><em>what you can become.</em></span><div className="ts-experience"><strong>15<span>years</span></strong><p>of experience.<br />A whole new chapter.</p></div></div>
        </section>

        <section id="our-story" className="ts-story landing-container" aria-labelledby="our-story-title">
          <div><span className="ts-label">Our story</span><h2 id="our-story-title">A new beginning.<br />A lasting <em>belief.</em></h2></div>
          <div className="ts-story-copy"><p className="ts-story-lead">A great gym starts long before the doors open.</p><p>Thrive is new. The passion behind it has been growing for years. Founded by Awet, it&apos;s a space built around a simple belief: give people the right environment, and they can go further.</p><p>That means equipment in abundance, room to explore your training, and people who make you feel at home. From your very first session to the routine you live for, there&apos;s a place for you here.</p></div>
        </section>

        <section className="ts-founder landing-container" aria-labelledby="founder-name">
          <div className="ts-founder-feature">
            <div className="ts-founder-identity"><Image src="/awet.jpg" alt="Awet, founder of Thrive Health & Fitness, standing in the gym" fill sizes="(max-width: 699px) 100vw, 50vw" /><span className="ts-founder-photo-shade" aria-hidden="true" /><div><span>Meet the founder</span><h2 id="founder-name">Awet.</h2><p>The experience behind Thrive.</p></div></div>
            <div className="ts-founder-story"><span className="ts-label">A life in fitness. A space for you.</span><h3>Years of dedication.<br /><em>One clear vision.</em></h3><p>Known in the fitness community, Awet brings 15 years of industry experience to Thrive. A new gym, shaped by a long-standing commitment to training and the people who show up for it.</p><p>His vision comes to life in a gym filled with choice: machines, free weights, and space to train your way. Serious about fitness. Welcoming from day one.</p><div className="ts-founder-years"><strong>15</strong><span>years in fitness.<br />The foundation for what comes next.</span></div></div>
          </div>
        </section>

        <div className="ts-inside-intro landing-container"><span className="ts-label">Inside Thrive</span><p>Free weights. Strength machines. Cardio. Open training space.<br />Everything to build your routine, with plenty to choose from.</p></div>
        <FacilitiesSection onOpenVideo={() => setTourOpen(true)} />

        <section className="ts-people landing-container" aria-labelledby="people-title">
          <div className="ts-people-heading"><h2 id="people-title">The people<br /><em>in your corner.</em></h2><div><p>Meet the Thrive team.<br />Different strengths. The same commitment to you.</p><Link className="ts-team-prices" href="/pricing#classes">See class prices<ArrowUpRight size={18} aria-hidden="true" /></Link></div></div>
          <div className="ts-coaches">
            <article className="ts-coach"><div className="ts-coach-photo"><Image src="/services/muay-thai.jpg" alt="Gloves representing the Muay Thai team" fill sizes="(max-width: 699px) 100vw, 33vw" /></div><div className="ts-coach-copy"><span>Muay Thai coach</span><h3>Duressa</h3><p>Technique, focus, and confidence. One session at a time.</p></div></article>
            <article className="ts-coach"><div className="ts-coach-photo"><Image src="/services/personal-training.jpg" alt="Personal training in a fitness studio" fill sizes="(max-width: 699px) 100vw, 33vw" /></div><div className="ts-coach-copy"><span>Strength & personal training</span><h3>Your coaching team.</h3><p>Guidance for your goals. Support for your progress.</p></div></article>
            <article className="ts-coach"><div className="ts-coach-photo"><Image src="/services/karate.jpg" alt="Karate practice representing the martial arts team" fill sizes="(max-width: 699px) 100vw, 33vw" /></div><div className="ts-coach-copy"><span>Kids’ karate</span><h3>Growing confidence.</h3><p>A team helping young learners build skill and discipline.</p></div></article>
          </div>
        </section>

        <section className="ts-visit landing-container" aria-labelledby="visit-title"><div><h2 id="visit-title">You&apos;ve seen the space.<br /><em>Come feel the difference.</em></h2><button type="button" className="ts-join" onClick={() => router.push('/join')}>Join Now<ArrowUpRight size={20} aria-hidden="true" /></button></div><div className="ts-visit-details"><a className="ts-phone" href="tel:+251913814546">091 381 4546<ArrowUpRight size={23} aria-hidden="true" /></a><a href="https://maps.google.com/?cid=2794173722916044271" target="_blank" rel="noopener noreferrer">Cheers meskelegna / Ayat Noah<br />Addis Ababa, Ethiopia</a></div></section>
      </main>
      <SiteFooter onJoinClick={() => router.push('/join')} />
      <TourVideoModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
