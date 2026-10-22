import type { Metadata } from 'next';
import AboutPage from '@/components/public/AboutPage';
import { publicMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = publicMetadata({
  title: 'About Thrive | Health & Fitness in Addis Ababa',
  description: 'A new space with deep roots in fitness. Explore the equipment, training spaces, and people behind Thrive Health & Fitness in Addis Ababa.',
}, '/about');

export default function Page() {
  return <AboutPage />;
}
