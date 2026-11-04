import { redirect } from 'next/navigation';

// Payouts moved into Payroll; keeps old links and notifications working.
export default function PayoutsPage() {
  redirect('/admin/payroll');
}
