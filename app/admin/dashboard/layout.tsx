'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Needs the matching permission; the API enforces the same on every call. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin', 'manager']} permission={['dashboard.operational', 'dashboard.business']}>
      {children}
    </RequireRole>
  );
}
