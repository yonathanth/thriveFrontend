import type { Metadata } from 'next';
import HomePage from '@/components/public/HomePage';
import { shareMeta } from '@/lib/seo';

const title = 'Thrive | 24/7 Gym & Martial Arts in Addis Ababa';
const description = '24/7 gym access, expert coaching, and martial arts classes in Addis Ababa.';

export const metadata: Metadata = {
  title,
  description,
  ...shareMeta({
    title,
    description,
    path: '/',
  }),
};

export default function Page() {
  return <HomePage />;
}
