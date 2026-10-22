'use client';

import { ArrowUpRight } from 'lucide-react';
import SiteFooter from './SiteFooter';
import './contact-footer.css';

const mapLink = 'https://maps.google.com/?cid=2794173722916044271';
const directionsLink = 'https://www.google.com/maps/dir/?api=1&destination=Thrive+Health+%26+Fitness%2C+Cheers+meskelegna%2C+Ayat+Noah%2C+Addis+Ababa';
const mapEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.721137117307!2d38.87770681154753!3d9.010670927637438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9b356c51b3d5%3A0x26c6e63263243def!2sThrive%20Health%20%26%20Fitness!5e0!3m2!1sen!2set!4v1792592141508!5m2!1sen!2set';

interface AboutContactSectionProps {
  onJoinClick: () => void;
}

export default function AboutContactSection({ onJoinClick }: AboutContactSectionProps) {
  return (
    <>
      <section id="contact" aria-labelledby="contact-heading" className="thrive-contact">
        <div className="landing-container">
          <div id="visit" className="thrive-contact-layout">
            <div className="thrive-contact-invitation">
              <h2 id="contact-heading">Your next chapter<br /><em>starts here.</em></h2>
              <button type="button" onClick={onJoinClick} className="thrive-contact-join">Join Now<span><ArrowUpRight size={21} aria-hidden="true" /></span></button>
            </div>
            <div className="thrive-contact-details">
              <div className="thrive-contact-item thrive-contact-call">
                <h3>Call us</h3>
                <a href="tel:+251913814546" className="thrive-contact-phone">091 381 4546<ArrowUpRight size={28} aria-hidden="true" /></a>
              </div>
              <div className="thrive-contact-item thrive-contact-location">
                <h3>Find us</h3>
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="thrive-contact-address">Cheers meskelegna<br />Ayat Noah, Addis Ababa<ArrowUpRight size={22} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
          <div className="thrive-contact-map">
            <div className="thrive-contact-map-heading"><a href={directionsLink} target="_blank" rel="noopener noreferrer">Get directions<ArrowUpRight size={18} aria-hidden="true" /></a></div>
            <iframe src={mapEmbed} title="Thrive Health & Fitness location in Addis Ababa" width="1200" height="420" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        </div>
      </section>
      <SiteFooter onJoinClick={onJoinClick} />
    </>
  );
}
