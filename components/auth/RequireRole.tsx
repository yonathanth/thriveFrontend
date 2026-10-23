'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { homeFor, Role } from '@/lib/roles';
import FullScreenSpinner from './FullScreenSpinner';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
}

/**
 * Shows children only to signed-in users with one of the roles and no pending
 * password change; everyone else is sent where they belong. The backend enforces
 * the same rules; this only keeps people out of pages they cannot use.
 */
export default function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const allowed = !!user && isAuthenticated && !user.mustChangePassword && roles.includes(user.role);

  useEffect(() => {
    if (isLoading || allowed) return;
    if (!isAuthenticated || !user) router.replace('/login');
    else if (user.mustChangePassword) router.replace('/change-password');
    else router.replace(homeFor(user.role));
  }, [allowed, isAuthenticated, isLoading, router, user]);

  if (!allowed) return <FullScreenSpinner />;
  return <>{children}</>;
}
