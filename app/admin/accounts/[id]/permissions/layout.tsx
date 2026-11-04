'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Admins only; the API refuses everyone else too. */
export default function AccountPermissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin']} permission="accounts.permissions.manage">
      {children}
    </RequireRole>
  );
}
