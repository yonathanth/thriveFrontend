'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import RequireRole from '@/components/auth/RequireRole';
import PortalShell, { PortalNavItem } from '@/components/portal/PortalShell';

const nav: PortalNavItem[] = [
  { name: 'Dashboard', href: '/member/dashboard', icon: 'dashboard', exact: true },
  { name: 'Membership', href: '/member', icon: 'card_membership', exact: true },
  { name: 'Attendance', href: '/member/attendance', icon: 'fact_check' },
  { name: 'History', href: '/member/history', icon: 'history' },
  { name: 'Profile', href: '/member/profile', icon: 'person' },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RequireRole roles={['member']}>
        <PortalShell nav={nav}>{children}</PortalShell>
      </RequireRole>
    </AuthProvider>
  );
}
