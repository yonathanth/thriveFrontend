import type { Metadata } from 'next';
import PricingPage from '@/components/public/PricingPage';
import { publicMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = publicMetadata({
  title: 'Prices & Memberships | Thrive Health & Fitness',
  description: 'Explore Standard and Happy Hour gym memberships, plus Muay Thai, kickboxing, kids’ karate, and personal training pricing enquiries in Addis Ababa.',
}, '/pricing');

export default function Page() {
  return <PricingPage />;
}
