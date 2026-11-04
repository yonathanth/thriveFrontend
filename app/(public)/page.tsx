import type { Metadata } from 'next';
import HomePage from '@/components/public/HomePage';
import { shareMeta } from '@/lib/seo';

const title = 'Thrive Gym | 24/7 Gym & Martial Arts in Ayat, Addis Ababa';
const description = 'Thrive Health & Fitness: a 24/7 gym in Ayat Noah, Addis Ababa, with strength training, personal coaching, Muay Thai, kickboxing and kids’ karate.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/' },
  ...shareMeta({
    title,
    description,
    path: '/',
  }),
};

export default function Page() {
  return <HomePage />;
}
