'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Needs the matching permission; the API enforces the same on every call. */
export default function PotentialCustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin', 'manager']} permission={'prospects.view'}>
      {children}
    </RequireRole>
  );
}
