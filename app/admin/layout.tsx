'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import NotificationBell from '@/components/admin/NotificationBell';
import { syncApi } from '@/lib/api';
import { homeFor, PANEL_ROLES } from '@/lib/roles';
import FullScreenSpinner from '@/components/auth/FullScreenSpinner';
import PortalFrame from '@/components/portal/PortalFrame';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sectionName = (pathname.split('/')[2] || 'dashboard').replaceAll('-', ' ');

  const signOut = () => {
    logout();
  };

  // The admin panel is for admins and managers with no pending password change.
  const canUsePanel =
    isAuthenticated && !!user && !user.mustChangePassword && PANEL_ROLES.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) router.replace('/login');
    else if (user.mustChangePassword) router.replace('/change-password');
    else if (!PANEL_ROLES.includes(user.role)) router.replace(homeFor(user.role));
  }, [isAuthenticated, isLoading, router, user]);

  // Fetch last sync time
  useEffect(() => {
    if (canUsePanel) {
      const fetchLastSync = async () => {
        try {
          const data = await syncApi.getLastSync();
          setLastSyncTime(data.lastSyncAt);
        } catch (error) {
          console.error('Failed to fetch last sync time:', error);
        }
      };
      fetchLastSync();
      // Refresh every 30 seconds
      const interval = setInterval(fetchLastSync, 30000);
      return () => clearInterval(interval);
    }
  }, [canUsePanel]);

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Show loading state
  if (isLoading) return <FullScreenSpinner />;

  // Redirect if not signed in, or not an admin/manager
  if (!canUsePanel) {
    return null;
  }

  return (
    <PortalFrame>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top header */}
        <header className="portal-header sticky top-0 z-30 backdrop-blur-lg">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                aria-controls="portal-navigation"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-white/60 hover:bg-surface-dark-lighter transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
              <span className="hidden text-white/40 sm:inline">{user?.role === 'manager' ? 'Manager' : 'Admin'}</span>
              <span className="material-symbols-outlined hidden text-base text-white/20 sm:inline">chevron_right</span>
              <span className="truncate font-medium capitalize">{sectionName}</span>
            </div>

            {/* Last Sync Time and Account dropdown */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Last Sync Time */}
              <div className="flex items-center gap-1 sm:gap-2 text-white/60 text-xs sm:text-sm">
                <span className="material-symbols-outlined text-base sm:text-lg">sync</span>
                <span>{formatLastSync(lastSyncTime)}</span>
              </div>

              {/* Notifications; Suspense because the bell reads the URL (?notification=) */}
              <Suspense fallback={null}>
                <NotificationBell />
              </Suspense>

              {/* Profile & Account Button */}
              <Link
                href="/admin/profile"
                aria-label="Profile & Account"
                title="Profile & Account"
                className={`p-2 rounded-lg text-white/60 hover:bg-surface-dark-lighter hover:text-white transition-colors ${
                  pathname === '/admin/profile' ? 'text-primary bg-primary/10' : ''
                }`}
              >
                <span className="material-symbols-outlined text-xl">account_circle</span>
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="p-2 rounded-lg text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="portal-content mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </PortalFrame>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  );
}





