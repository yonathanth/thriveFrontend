import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteFrame from '@/components/public/SiteFrame';
import AuthShell from '@/components/auth/AuthShell';

export default function NotFound() {
  return (
    <SiteFrame>
      <AuthShell eyebrow="404 · Page not found" title={<>A little<br /><em>off track.</em></>} description="This page may have moved, or the link might be a little off. Let’s get you back to Thrive.">
        <div className="ta-state-actions"><Link className="ta-primary" href="/">Back to home<ArrowUpRight size={19} aria-hidden="true" /></Link><Link href="/services">Explore our training</Link></div>
      </AuthShell>
    </SiteFrame>
  );
}
