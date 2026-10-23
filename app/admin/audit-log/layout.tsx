'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Admins only; the API refuses managers too. */
export default function AuditLogLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin']}>
      {children}
    </RequireRole>
  );
}
