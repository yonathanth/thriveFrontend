'use client';

import Image from 'next/image';
import BrandLogo from './BrandLogo';
import { ArrowUpRight } from 'lucide-react';
import './about-section.css';

interface AboutSectionProps {
  onJoinClick: () => void;
  onOpenVideo: () => void;
}

export default function AboutSection({ onJoinClick, onOpenVideo }: AboutSectionProps) {
  return (
    <section id="about" aria-labelledby="about-heading" className="thrive-about-section">
      <div className="landing-container">
        <div className="thrive-about-heading">
          <div>
            <h2 id="about-heading">More than a gym.<br />A place to <em>thrive.</em></h2>
          </div>
        </div>

        <div className="thrive-about-grid">
          <article className="thrive-about-card thrive-about-access">
            <span className="thrive-about-metric">24/7</span>
            <div className="thrive-about-cardCopy">
              <h3>Your time.<br />Your pace.<br /><em>Your gym.</em></h3>
              <p>Open all day. Every day. Train whenever it works for you.</p>
            </div>
            <span className="thrive-about-watermark"><BrandLogo className="thrive-logo--watermark" decorative /></span>
          </article>

          <button type="button" onClick={onOpenVideo} className="thrive-about-card thrive-about-space" aria-label="Watch a tour of the Thrive gym">
            <Image src="/tour-thumbnail.jpg" alt="A coach supporting a member with strength training on the gym floor" fill sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 38vw" className="thrive-about-spaceImage" />
            <div className="thrive-about-imageShade" />
            <div className="thrive-about-spaceCaption">
              <span className="thrive-about-tourLink">Step inside Thrive <span className="thrive-about-roundArrow"><ArrowUpRight size={19} aria-hidden="true" /></span></span>
            </div>
          </button>

          <article className="thrive-about-card thrive-about-approach">
            <div className="thrive-about-equipmentCopy">
              <h3>Everything you need.<br /><em>And plenty of it.</em></h3>
              <p>Machines, free weights, and cardio. Fully stocked for every workout.</p>
            </div>
            <div className="thrive-about-personalTraining">
              <span className="thrive-about-metric">1:1</span>
              <h4>Expert trainers.<br />Personal attention.</h4>
              <p>Expert coaching, built around you and your goals.</p>
            </div>
          </article>

          <div className="thrive-about-card thrive-about-invitation">
            <div className="thrive-about-invitationCopy"><h3>There&apos;s a place for <em>you here.</em></h3></div>
            <button type="button" onClick={onJoinClick} className="thrive-about-joinButton">Come find your Thrive <span aria-hidden="true"><ArrowUpRight size={17} /></span></button>
          </div>
        </div>
      </div>
    </section>
  );
}
