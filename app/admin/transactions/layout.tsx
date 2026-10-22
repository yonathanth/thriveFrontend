'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Admins only; the API refuses managers too. */
export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin']} loginPath="/admin/login">
      {children}
    </RequireRole>
  );
}
