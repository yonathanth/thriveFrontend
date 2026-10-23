'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Money is admin-only; the API refuses managers too. */
export default function InventorySalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin']}>
      {children}
    </RequireRole>
  );
}
