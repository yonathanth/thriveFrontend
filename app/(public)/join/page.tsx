import type { Metadata } from 'next';
import { Suspense } from 'react';
import JoinPage from '@/components/public/JoinPage';
import { API_URL } from '@/lib/api';
import { getCatalog } from '@/lib/catalog';
import { arrangePlans } from '@/lib/public/packages';
import { publicMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = publicMetadata({
  title: 'Join Thrive | Choose Your Membership',
  description: 'Choose your Thrive membership and pay online with Telebirr, CBE Birr or your bank, or leave your details and pay at the front desk.',
}, '/join');

export const revalidate = 60;

/** Whether paying online is switched on; the page offers paying at the desk either way. */
async function onlinePaymentAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/public/join/available`, { next: { revalidate: 60 } });
    if (!res.ok) return false;
    return ((await res.json()) as { available?: boolean }).available === true;
  } catch {
    return false;
  }
}

export default async function Page() {
  const [catalog, payOnline] = await Promise.all([getCatalog(), onlinePaymentAvailable()]);
  return (
    <Suspense fallback={<div className="landing-container" style={{ paddingTop: 150 }}>Getting your options ready…</div>}>
      <JoinPage sections={arrangePlans(catalog.plans)} payOnline={payOnline} />
    </Suspense>
  );
}
