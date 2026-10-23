import type { ReactNode } from 'react';
import { brandFont } from '@/lib/brand-font';
import './portal.css';

/** One visual foundation for all signed-in workspaces. */
export default function PortalFrame({ children }: { children: ReactNode }) {
  return <div className={`thrive-portal ${brandFont.variable}`}>{children}</div>;
}
