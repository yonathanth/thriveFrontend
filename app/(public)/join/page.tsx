import type { Metadata } from 'next';
import { Suspense } from 'react';
import JoinPage from '@/components/public/JoinPage';
import { publicMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = publicMetadata({
  title: 'Join Thrive | Choose Your Training',
  description: 'Choose your gym membership, martial arts class, or personal training at Thrive Health & Fitness in Addis Ababa.',
}, '/join');

export default function Page() {
  return <Suspense fallback={<div className="landing-container" style={{ paddingTop: 150 }}>Getting your options ready…</div>}><JoinPage /></Suspense>;
}
