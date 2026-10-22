'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { SITE_NAME } from '@/lib/site';

export interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  /** Only this exact path is active (for a section's home page). */
  exact?: boolean;
}

export interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

interface AppSidebarProps {
  sections: SidebarSection[];
  /** Small label under the logo, e.g. "Admin Panel". */
  subtitle: string;
  homeHref: string;
  isOpen: boolean;
  onClose: () => void;
  footer?: ReactNode;
}

export function isActivePath(pathname: string, item: SidebarItem): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Left navigation shared by the admin panel and the trainer and member portals. */
export default function AppSidebar({ sections, subtitle, homeHref, isOpen, onClose, footer }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col border-r border-white/5 bg-gradient-to-b from-[#0b1220] via-[#0a0d14] to-[#080808] transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="px-5 pb-5">
          <Link href={homeHref} onClick={onClose} className="flex flex-col items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thrive-logo.png" alt={SITE_NAME} className="h-20 w-auto object-contain" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-wider text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              {subtitle}
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {sections.map((section, i) => (
            <div key={section.label ?? i} className={i > 0 ? 'mt-5' : ''}>
              {section.label && (
                <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/30">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${active
                            ? 'bg-primary/15 text-white shadow-[inset_0_0_0_1px_rgba(59,140,255,0.25)]'
                            : 'text-white/55 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_rgba(59,140,255,0.8)]" />
                        )}
                        <span
                          className={`material-symbols-outlined text-[20px] transition-colors ${active ? 'text-primary' : 'text-white/40 group-hover:text-white/80'
                            }`}
                        >
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {footer && <div className="border-t border-white/5 p-3">{footer}</div>}
      </aside>
    </>
  );
}

/** Initials in a blue disc, for the signed-in user. */
export function UserAvatar({ name, size = 'md' }: { name?: string | null; size?: 'md' | 'lg' }) {
  const initials =
    (name ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-bright to-[#1d4ed8] font-semibold text-white ${size === 'lg' ? 'size-12 text-base' : 'size-9 text-sm'
        }`}
    >
      {initials}
    </span>
  );
}
