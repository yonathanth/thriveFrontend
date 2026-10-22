import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { offerings } from '@/lib/public/offerings';
import './services.css';

const featuredServices = [offerings[0], offerings[1], {
  ...offerings[2], title: 'Muay Thai & kids’ karate',
  summary: 'Muay Thai with Duressa. Karate for kids. Find your discipline.',
  prompt: 'Explore the classes',
}];

export default function ServicesSection() {
  return (
    <section id="services" aria-labelledby="services-heading" className="thrive-services">
      <div className="landing-container">
        <div className="thrive-services-heading">
          <h2 id="services-heading">Find your strength.<br /><em>Make it your own.</em></h2>
        </div>
        <div className="thrive-services-list">
          {featuredServices.map((service) => (
            <Link href={`/services#${service.slug}`} key={service.slug} className="thrive-service-card">
              <Image src={service.photo} alt={service.alt} fill sizes="(max-width: 699px) 100vw, 33vw" className="thrive-service-photo" />
              <div className="thrive-service-photo-shade" />
              <div className="thrive-service-copy">
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
              </div>
              <span className="thrive-service-link">{service.prompt}<ArrowUpRight size={18} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
