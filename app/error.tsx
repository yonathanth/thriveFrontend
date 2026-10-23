'use client';

import Link from 'next/link';
import { RotateCw } from 'lucide-react';
import SiteFrame from '@/components/public/SiteFrame';
import AuthShell from '@/components/auth/AuthShell';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <SiteFrame>
      <AuthShell eyebrow="Let’s try again" title={<>A momentary<br /><em>pause.</em></>} description="We couldn’t load this page. Try again, or head back to the website.">
        <div className="ta-state-actions"><button type="button" className="ta-primary" onClick={reset}>Try again<RotateCw size={18} aria-hidden="true" /></button><Link href="/">Back to home</Link></div>
      </AuthShell>
    </SiteFrame>
  );
}
