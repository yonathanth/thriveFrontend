'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import AccountDropdown from '@/components/admin/AccountDropdown';
import NotificationBell from '@/components/admin/NotificationBell';
import { syncApi } from '@/lib/api';
import { homeFor, PANEL_ROLES } from '@/lib/roles';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if current page is login
  const isLoginPage = pathname === '/admin/login';

  // The admin panel is for admins and managers with no pending password change.
  const canUsePanel =
    isAuthenticated && !!user && !user.mustChangePassword && PANEL_ROLES.includes(user.role);

  useEffect(() => {
    if (isLoading || isLoginPage) return;
    if (!isAuthenticated || !user) router.push('/admin/login');
    else if (user.mustChangePassword) router.replace('/change-password');
    else if (!PANEL_ROLES.includes(user.role)) router.replace(homeFor(user.role));
  }, [isAuthenticated, isLoading, isLoginPage, router, user]);

  // Fetch last sync time
  useEffect(() => {
    if (canUsePanel && !isLoginPage) {
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
  }, [canUsePanel, isLoginPage]);

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
  if (isLoading && !isLoginPage) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Login page - no sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Redirect if not signed in, or not an admin/manager
  if (!canUsePanel) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background-dark/80 backdrop-blur-lg border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-white/60 hover:bg-surface-dark-lighter transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            <div className="flex-1 lg:flex-none" />

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

              {/* Account dropdown */}
              <AccountDropdown />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}





