'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Inventory money needs inventory.money.view; the API checks too. */
export default function InventorySalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin', 'manager']} permission="inventory.money.view">
      {children}
    </RequireRole>
  );
}
