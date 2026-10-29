import type { Metadata } from 'next';
import PricingPage from '@/components/public/PricingPage';
import { getCatalog } from '@/lib/catalog';
import { arrangePlans } from '@/lib/public/packages';
import { publicMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = publicMetadata({
  title: 'Prices & Memberships | Thrive Health & Fitness',
  description: 'Every Thrive gym membership, couple package and class with its price, in Ayat Noah, Addis Ababa. Join and pay online.',
}, '/pricing');

/** Prices come from the gym app's catalog, refreshed every minute. */
export const revalidate = 60;

export default async function Page() {
  const catalog = await getCatalog();
  return <PricingPage sections={arrangePlans(catalog.plans)} addons={catalog.addons} classes={catalog.classes} />;
}
