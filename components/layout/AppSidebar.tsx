'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef } from 'react';
import BrandLogo from '@/components/public/BrandLogo';

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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function isActivePath(pathname: string, item: SidebarItem): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Left navigation shared by the admin panel and the trainer and member portals. */
export default function AppSidebar({
  sections,
  subtitle,
  homeHref,
  isOpen,
  onClose,
  footer,
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const closeButton = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const controls = sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) onClose(); };
    desktop.addEventListener('change', closeOnDesktop);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      desktop.removeEventListener('change', closeOnDesktop);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

      <aside
        ref={sidebarRef}
        id="portal-navigation"
        aria-label={`${subtitle} navigation`}
        className={`portal-sidebar fixed top-0 left-0 h-dvh z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full invisible lg:visible'}`}
      >
        <div className={`portal-brand relative ${isCollapsed ? 'flex flex-col items-center justify-center !p-4' : 'flex items-center justify-between'}`}>
          {!isCollapsed ? (
            <>
              <Link href={homeHref} onClick={onClose} className="flex flex-col items-start min-w-0" aria-label="Thrive — dashboard">
                <BrandLogo />
                <span className="portal-role truncate">{subtitle}</span>
              </Link>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                  className="hidden lg:flex items-center justify-center size-8 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
              )}
            </>
          ) : (
            <>
              <Link href={homeHref} onClick={onClose} className="flex items-center justify-center" aria-label="Thrive — dashboard" title="Thrive">
                <Image src="/favicon/favicon.svg" alt="Thrive" width={32} height={32} className="size-8 rounded-lg" />
              </Link>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                  className="hidden lg:flex mt-3 items-center justify-center size-8 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              )}
            </>
          )}
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Close menu" className="absolute right-2 top-3 rounded-lg p-2 text-white/60 hover:bg-white/5 lg:hidden">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav aria-label="Main navigation" className={`flex-1 min-h-0 overflow-y-auto pb-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {sections.map((section, i) => (
            <div key={section.label ?? i} className={i > 0 ? (isCollapsed ? 'mt-3 pt-3 border-t border-white/5' : 'mt-5') : ''}>
              {section.label && !isCollapsed && (
                <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/30 truncate">
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
                        title={item.name}
                        aria-label={item.name}
                        className={`portal-nav-link group relative flex items-center rounded-lg text-sm font-medium transition-colors ${
                          isCollapsed
                            ? 'justify-center p-2.5'
                            : 'gap-3 px-3 py-2.5'
                        } ${active ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
                            active ? 'text-primary' : 'text-white/40 group-hover:text-white/80'
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {footer && <div className={`border-t border-white/5 ${isCollapsed ? 'p-2' : 'p-3'}`}>{footer}</div>}
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
      className={`portal-avatar inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${size === 'lg' ? 'size-12 text-base' : 'size-9 text-sm'
        }`}
    >
      {initials}
    </span>
  );
}
