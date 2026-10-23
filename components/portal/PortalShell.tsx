'use client';

import { ReactNode, useCallback, useState } from 'react';
import Link from 'next/link';
import { Bell, CircleUserRound, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import AppSidebar, { SidebarItem, UserAvatar, isActivePath } from '@/components/layout/AppSidebar';
import PortalFrame from './PortalFrame';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

export type PortalNavItem = SidebarItem;

/** Sidebar layout for the trainer and member portals, matching the admin panel. */
export default function PortalShell({ nav, children }: { nav: PortalNavItem[]; children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();

  const current = nav.find((item) => isActivePath(pathname, item));
  const roleLabel = user ? ROLE_LABELS[user.role] : '';
  const isTrainer = user?.role === 'trainer';
  const profileHref = isTrainer ? '/trainer/profile' : '/member/profile';

  const signOut = () => {
    logout();
    router.replace('/login');
  };

  return (
    <PortalFrame>
      <AppSidebar
        sections={[{ label: 'Menu', items: nav }]}
        subtitle={`${roleLabel} Portal`}
        homeHref={nav[0]?.href ?? '/'}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        footer={
          user && (
            <div className="space-y-1">
              {isCollapsed ? (
                <Link
                  href={profileHref}
                  onClick={closeSidebar}
                  className="flex items-center justify-center rounded-lg bg-white/3 p-2 transition-colors hover:bg-white/5"
                  aria-label="Open your profile"
                  title={user.name}
                >
                  <UserAvatar name={user.name} />
                </Link>
              ) : (
                <Link
                  href={profileHref}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-lg bg-white/3 px-3 py-2.5 transition-colors hover:bg-white/5"
                  aria-label="Open your profile"
                >
                  <UserAvatar name={user.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/40">{user.phone ?? user.email ?? roleLabel}</p>
                  </div>
                </Link>
              )}
            </div>
          )
        }
      />

      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="portal-header sticky top-0 z-30 backdrop-blur-lg">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 lg:hidden"
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                aria-controls="portal-navigation"
              >
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-white/40 sm:inline">{roleLabel}</span>
              {current && (
                <>
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-white/20 hidden sm:inline">chevron_right</span>
                  <span className="truncate font-medium text-white">{current.name}</span>
                </>
              )}
            </div>
            <div className="flex-1" />
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled
                aria-label="Notifications (coming soon)"
                title="Notifications coming soon"
                className="flex size-10 items-center justify-center rounded-lg text-white/40"
              >
                <Bell size={20} aria-hidden="true" />
              </button>
              <Link
                href={profileHref}
                aria-label="Open your profile"
                title="Profile"
                aria-current={pathname === profileHref ? 'page' : undefined}
                className="flex size-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white aria-[current=page]:text-primary"
              >
                <CircleUserRound size={21} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="flex h-10 items-center justify-center gap-2 rounded-lg px-2.5 text-sm text-white/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={19} aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="portal-content mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </PortalFrame>
  );
}
