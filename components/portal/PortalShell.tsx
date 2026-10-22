'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import AppSidebar, { SidebarItem, UserAvatar, isActivePath } from '@/components/layout/AppSidebar';

export type PortalNavItem = SidebarItem;

/** Sidebar layout for the trainer and member portals, matching the admin panel. */
export default function PortalShell({ nav, children }: { nav: PortalNavItem[]; children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = nav.find((item) => isActivePath(pathname, item));
  const roleLabel = user ? ROLE_LABELS[user.role] : '';

  const signOut = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <AppSidebar
        sections={[{ label: 'Menu', items: nav }]}
        subtitle={`${roleLabel} Portal`}
        homeHref={nav[0]?.href ?? '/'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        footer={
          user && (
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-lg bg-white/3 px-3 py-2.5">
                <UserAvatar name={user.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user.name}</p>
                  <p className="truncate text-xs text-white/40">{user.phone ?? user.email ?? roleLabel}</p>
                </div>
              </div>
              <Link
                href="/change-password"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">key</span>
                Change password
              </Link>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/55 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Sign out
              </button>
            </div>
          )
        }
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-background-dark/80 backdrop-blur-lg">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 lg:hidden"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/40">{roleLabel}</span>
              {current && (
                <>
                  <span className="material-symbols-outlined text-base text-white/20">chevron_right</span>
                  <span className="font-medium text-white">{current.name}</span>
                </>
              )}
            </div>
            <div className="flex-1" />
            <span className="hidden text-sm text-white/40 sm:inline">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
