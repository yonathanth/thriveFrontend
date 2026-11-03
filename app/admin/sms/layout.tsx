'use client';

import RequireRole from '@/components/auth/RequireRole';

/** Needs the matching permission; the API enforces the same on every call. */
export default function SmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin', 'manager']} permission={['sms.send', 'sms.bulk', 'sms.history.view']} loginPath="/admin/login">
      {children}
    </RequireRole>
  );
}
