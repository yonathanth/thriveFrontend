'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import './contact-page.css';

const directions = 'https://www.google.com/maps/dir/?api=1&destination=Thrive+Health+%26+Fitness%2C+Cheers+meskelegna%2C+Ayat+Noah%2C+Addis+Ababa';
const mapEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.721137117307!2d38.87770681154753!3d9.010670927637438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9b356c51b3d5%3A0x26c6e63263243def!2sThrive%20Health%20%26%20Fitness!5e0!3m2!1sen!2set!4v1792592141508!5m2!1sen!2set';

export default function ContactPage() {
  const router = useRouter();
  return (
    <div className="thrive-connect-page">
      <Navbar onJoinClick={() => router.push('/join')} />
      <main className="landing-container">
        <section className="tc-intro" aria-labelledby="connect-title"><h1 id="connect-title">Good things start<br /><em>with a hello.</em></h1><p>Questions about training, classes, or joining?<br />Let&apos;s find your next step.</p></section>

        <section className="tc-connect" aria-label="Get in touch">
          <div className="tc-call"><span className="tc-call-label">We&apos;re a call away.</span><a href="tel:+251913814546" className="tc-number" aria-label="Call Thrive on 091 381 4546"><span>091 381 4546</span><ArrowUpRight size={48} strokeWidth={1.4} aria-hidden="true" /></a><a className="tc-call-button" href="tel:+251913814546">Call us<ArrowUpRight size={20} aria-hidden="true" /></a><div className="tc-call-bottom"><span>Addis Ababa, Ethiopia</span><span>Thrive Health & Fitness</span></div></div>
          <div className="tc-visit" aria-labelledby="tc-location-title"><div className="tc-location"><span>Find your way here.</span><h2 id="tc-location-title">Cheers meskelegna<br /><em>Ayat Noah.</em></h2><p>Addis Ababa, Ethiopia</p><a href={directions} target="_blank" rel="noopener noreferrer">Get directions<ArrowUpRight size={20} aria-hidden="true" /></a></div><div className="tc-hours"><span>Our doors are open.</span><strong>24/7<span className="tc-open-dot" aria-hidden="true" /></strong><p>Every day. Whenever you&apos;re ready.</p><Link href="/pricing#classes">Class times & prices<ArrowUpRight size={18} aria-hidden="true" /></Link></div></div>
        </section>

        <div className="tc-map"><iframe src={mapEmbed} title="Find Thrive Health & Fitness in Addis Ababa" width="1200" height="490" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /><div className="tc-map-caption"><span>Thrive Health & Fitness · Addis Ababa</span><a href={directions} target="_blank" rel="noopener noreferrer">Open directions<ArrowUpRight size={17} aria-hidden="true" /></a></div></div>
        <section className="tc-final" aria-label="Membership prices"><p>Ready to make it<br /><em>your place?</em></p><Link href="/pricing">See prices<ArrowUpRight size={22} aria-hidden="true" /></Link></section>
      </main>
      <SiteFooter onJoinClick={() => router.push('/join')} />
    </div>
  );
}
