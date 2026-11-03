import type { Metadata } from 'next';
import ContactPage from '@/components/public/ContactPage';
import { publicMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = publicMetadata({
  title: 'Contact & Location | Thrive Health & Fitness',
  description: 'Call Thrive Health & Fitness on 097 008 4408 or 091 219 0603, or find directions to our gym at Cheers meskelegna / Ayat Noah, Addis Ababa. Open 24/7.',
}, '/contact');

export default function Page() {
  return <ContactPage />;
}
