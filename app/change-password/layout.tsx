import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import SiteFrame from '@/components/public/SiteFrame';

export const metadata: Metadata = {
  title: 'Change password',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#0b1013' };

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame><AuthProvider>{children}</AuthProvider></SiteFrame>;
}
