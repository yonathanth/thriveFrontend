'use client';

import RequireRole from '@/components/auth/RequireRole';
import MyPay from '@/components/payroll/MyPay';

export default function AdminMyPayPage() {
  return (
    <RequireRole roles={['admin', 'manager']}>
      <MyPay />
    </RequireRole>
  );
}
