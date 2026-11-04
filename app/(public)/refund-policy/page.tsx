import type { Metadata } from 'next';
import LegalPage from '@/components/public/LegalPage';
import { refundContent } from '@/lib/legal-content';

export const metadata: Metadata = { title: 'Refund Policy | Thrive Gym' };

export default function Page() {
  return <LegalPage title="Refund Policy" intro="How refunds work for membership renewals paid online." sections={refundContent} />;
}
