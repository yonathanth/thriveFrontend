'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { homeFor, Role } from '@/lib/roles';
import type { Permission } from '@/lib/permissions';
import FullScreenSpinner from './FullScreenSpinner';
import NoAccess from './NoAccess';

interface RequireRoleProps {
  roles: Role[];
  /** Also needs at least one of these permissions; otherwise a "no access" notice. */
  permission?: Permission | Permission[];
  children: ReactNode;
  /** Where to send signed-out visitors. */
  loginPath?: string;
}

/**
 * Shows children only to signed-in users with one of the roles and no pending
 * password change; everyone else is sent where they belong. The backend enforces
 * the same rules; this only keeps people out of pages they cannot use.
 */
export default function RequireRole({ roles, permission, children, loginPath = '/login' }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading, can } = useAuth();
  const router = useRouter();

  const allowed = !!user && isAuthenticated && !user.mustChangePassword && roles.includes(user.role);

  useEffect(() => {
    if (isLoading || allowed) return;
    if (!isAuthenticated || !user) router.replace(loginPath);
    else if (user.mustChangePassword) router.replace('/change-password');
    else router.replace(homeFor(user.role));
  }, [allowed, isAuthenticated, isLoading, loginPath, router, user]);

  if (!allowed) return <FullScreenSpinner />;
  // Right role, missing permission: say so rather than bouncing them around.
  if (permission && !can(permission)) return <NoAccess />;
  return <>{children}</>;
}
