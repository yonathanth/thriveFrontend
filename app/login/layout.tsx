import type { Metadata, Viewport } from 'next';
import SiteFrame from '@/components/public/SiteFrame';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#0b1013' };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
