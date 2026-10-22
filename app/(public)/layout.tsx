import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import type { Viewport } from 'next';
import SiteMotion from '@/components/public/SiteMotion';
import '@/components/public/site-motion.css';
import './public.css';

const sansFont = Plus_Jakarta_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const editorialFont = Playfair_Display({
  variable: '--font-editorial',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const viewport: Viewport = { themeColor: '#050507' };

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`thrive-public ${sansFont.variable} ${editorialFont.variable}`}>
      <SiteMotion>{children}</SiteMotion>
    </div>
  );
}
