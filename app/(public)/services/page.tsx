import type { Metadata } from 'next';
import ServicesMembershipPage from '@/components/public/ServicesMembershipPage';
import { publicMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = publicMetadata({
  title: 'Offerings | Thrive Health & Fitness',
  description: 'Explore gym training, personal coaching, Muay Thai with Duressa, kickboxing, and kids’ karate at Thrive Health & Fitness in Addis Ababa.',
}, '/services');

export default function ServicesPage() {
  return <ServicesMembershipPage />;
}
