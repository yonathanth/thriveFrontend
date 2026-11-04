'use client';

import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import { LEGAL_UPDATED, type LegalSection } from '@/lib/legal-content';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';
import './memberships.css';

/** A plain policy page (Terms, Refund Policy) in the public site's frame. */
export default function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  const router = useRouter();
  const join = () => router.push('/join');

  return (
    <div className="thrive-memberships-page">
      <Navbar onJoinClick={join} />
      <main className="landing-container">
        <header className="tm-pricing-intro">
          <div>
            <h1>{title}</h1>
            <p>{intro}</p>
            <p style={{ fontSize: 13, opacity: 0.7 }}>Last updated {LEGAL_UPDATED}</p>
          </div>
        </header>
        <article style={{ maxWidth: 760, paddingBottom: 80 }}>
          {sections.map((s) => (
            <section key={s.heading} style={{ marginTop: 36 }}>
              <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em' }}>{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p} style={{ marginTop: 12, color: '#a9b4ba', lineHeight: 1.7 }}>{p}</p>
              ))}
            </section>
          ))}
          <p style={{ marginTop: 48, color: '#a9b4ba' }}>
            Questions? Call us on <a href={`tel:${PHONE_E164}`} style={{ textDecoration: 'underline' }}>{PHONE_DISPLAY}</a>.
          </p>
        </article>
      </main>
      <SiteFooter onJoinClick={join} />
    </div>
  );
}
