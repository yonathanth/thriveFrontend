'use client';

import Link from 'next/link';
import './contact-footer.css';

export default function SiteFooter({ onJoinClick }: { onJoinClick: () => void }) {
  return (
    <footer className="thrive-footer">
      <div className="landing-container">
        <div className="thrive-footer-columns">
          <nav aria-label="Explore Thrive"><h2>Explore</h2>
            <Link href="/#home">Home</Link><Link href="/about">About</Link><Link href="/about#facilities">Facilities</Link><Link href="/contact">Contact</Link>
            <Link href="/services">Offerings</Link><Link href="/pricing">Prices</Link>
            <Link href="/faq">FAQ</Link><Link href="/login">Member & staff sign in</Link>
          </nav>
          <nav aria-label="Training services"><h2>Training</h2>
            <Link href="/services#strength-and-conditioning">Strength & conditioning</Link>
            <Link href="/services#personal-training">Personal training</Link>
            <Link href="/services#muay-thai">Muay Thai</Link>
            <Link href="/services#kickboxing">Kickboxing</Link>
            <Link href="/services#kids-karate">Kids’ karate</Link>
            <Link href="/pricing#memberships">Memberships</Link>
            <button type="button" onClick={onJoinClick}>Become a member</button>
          </nav>
          <nav aria-label="Visit Thrive"><h2>Visit us</h2>
            <a href="https://www.google.com/maps/dir/?api=1&destination=Thrive+Health+%26+Fitness%2C+Cheers+meskelegna%2C+Ayat+Noah%2C+Addis+Ababa" target="_blank" rel="noopener noreferrer">Get directions</a>
            <a href="tel:+251913814546">091 381 4546</a>
            <a href="https://maps.google.com/?cid=2794173722916044271" target="_blank" rel="noopener noreferrer">Addis Ababa, Ethiopia</a>
            <span>Open 24 hours, every day</span>
          </nav>
        </div>
        <div className="thrive-footer-wordmark" aria-hidden="true">thrive</div>
        <div className="thrive-footer-bottom"><p>© 2026 Thrive Health & Fitness. All rights reserved.</p><span>Made for the way you move.</span></div>
      </div>
    </footer>
  );
}
