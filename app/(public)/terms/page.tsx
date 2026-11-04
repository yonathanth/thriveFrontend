import type { Metadata } from 'next';
import LegalPage from '@/components/public/LegalPage';
import { termsContent } from '@/lib/legal-content';

export const metadata: Metadata = { title: 'Terms | Thrive Gym' };

export default function Page() {
  return <LegalPage title="Terms" intro="The terms for using our website and paying for your membership online." sections={termsContent} />;
}
