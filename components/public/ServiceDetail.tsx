'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Service } from '@/lib/public/services';
import ServiceIllustration from './ServiceIllustration';
import './landing.css';
import './services.css';

export default function ServiceDetail({ service }: { service: Service }) {
  const router = useRouter();
  return (
    <div className="thrive-service-detail">
      <div className="landing-container">
        <header className="thrive-service-nav">
          <Link href="/" className="thrive-service-brand" aria-label="Thrive — home"><BrandLogo /></Link>
          <Link href="/services"><ArrowLeft size={15} aria-hidden="true" />All services</Link>
        </header>
        <main>
          <div className="thrive-service-detail-hero">
            <div>
              <span className="thrive-service-detail-label">{service.title}</span>
              <h1>{service.headline}</h1>
              <p>{service.description}</p>
              <button type="button" onClick={() => router.push('/join')} className="thrive-service-detail-button">Let&apos;s get you started<ArrowUpRight size={18} aria-hidden="true" /></button>
            </div>
            <ServiceIllustration kind={service.kind} />
          </div>
          <div className="thrive-service-includes">
            {service.includes.map((item) => <article key={item.title}><h2>{item.title}</h2><p>{item.description}</p></article>)}
          </div>
        </main>
        <Link href="/services" className="thrive-service-detail-footer"><ArrowLeft size={16} aria-hidden="true" />Explore the other services</Link>
      </div>
    </div>
  );
}
