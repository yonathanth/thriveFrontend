import type { Viewport } from 'next';
import SiteFrame from '@/components/public/SiteFrame';
import SiteMotion from '@/components/public/SiteMotion';
import '@/components/public/site-motion.css';

export const viewport: Viewport = { themeColor: '#050507' };

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame><SiteMotion>{children}</SiteMotion></SiteFrame>;
}
