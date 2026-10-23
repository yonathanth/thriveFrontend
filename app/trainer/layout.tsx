'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import RequireRole from '@/components/auth/RequireRole';
import PortalShell, { PortalNavItem } from '@/components/portal/PortalShell';

const nav: PortalNavItem[] = [
  { name: 'My members', href: '/trainer', icon: 'group', exact: true },
  { name: 'Schedule', href: '/trainer/schedule', icon: 'calendar_month' },
  { name: 'Profile', href: '/trainer/profile', icon: 'person' },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RequireRole roles={['trainer']}>
        <PortalShell nav={nav}>{children}</PortalShell>
      </RequireRole>
    </AuthProvider>
  );
}
