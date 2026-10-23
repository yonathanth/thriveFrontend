import { Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import { brandFont } from '@/lib/brand-font';
import './site-frame.css';

const editorialFont = Playfair_Display({
  variable: '--font-editorial',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

/** Shared visual foundation for the website and full-page account screens. */
export default function SiteFrame({ children }: { children: ReactNode }) {
  return <div className={`thrive-public ${brandFont.variable} ${editorialFont.variable}`}>{children}</div>;
}
