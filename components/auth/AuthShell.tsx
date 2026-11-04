import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/public/BrandLogo';
import './auth.css';

interface AuthShellProps {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  fullscreen?: boolean;
}

export default function AuthShell({ eyebrow, title, description, children, footer, fullscreen = false }: AuthShellProps) {
  return (
    <div className={`thrive-auth${fullscreen ? ' thrive-auth--fullscreen' : ''}`}>
      {!fullscreen && <header className="ta-header">
        <Link href="/" aria-label="Thrive — home"><BrandLogo /></Link>
        <Link className="ta-back" href="/"><ArrowLeft size={16} aria-hidden="true" /><span>Back to website</span></Link>
      </header>}
      <main className="ta-layout">
        <section className="ta-workspace" aria-labelledby="auth-heading">
          <div className="ta-form-content">
            {fullscreen && <Link className="ta-inline-brand" href="/" aria-label="Thrive — home"><BrandLogo /></Link>}
            {eyebrow && <span className="ta-eyebrow">{eyebrow}</span>}
            <h1 id="auth-heading">{title}</h1>
            <p className="ta-description">{description}</p>
            {children}
            {footer && <div className="ta-form-footer">{footer}</div>}
          </div>
        </section>
      </main>
      {!fullscreen && <footer className="ta-footer"><span>Thrive Health & Fitness</span><span>Made for the way you move.</span></footer>}
    </div>
  );
}
