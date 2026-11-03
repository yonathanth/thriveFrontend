'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Needs finance.view (admins, or a manager an admin granted it); the API checks too. */
export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin', 'manager']} permission="finance.view" loginPath="/admin/login">
      {children}
    </RequireRole>
  );
}
