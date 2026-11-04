import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Password help | Thrive',
  description: 'Contact the Thrive front desk for help getting back into your account.',
  robots: { index: false, follow: false },
};

export default function PasswordHelpPage() {
  return (
    <AuthShell fullscreen title={<>Let’s get you <em>back in.</em></>} description="Forgot your password? Our front desk can help." footer={<Link href="/login"><ArrowLeft size={15} aria-hidden="true" />Back to sign in</Link>}>
      <div className="ta-recovery ta-recovery--simple">
        <h2>Talk to our front desk.</h2>
        <p>Call or visit the gym to verify your account and receive a temporary password. You’ll choose a new one when you sign in.</p>
        <a className="ta-primary" href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}<ArrowUpRight size={19} aria-hidden="true" /></a>
      </div>
      <div className="ta-help"><strong>Signing in for the first time?</strong><p>Use the phone number registered at the gym and the temporary password from our team.</p></div>
    </AuthShell>
  );
}
