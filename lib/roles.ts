// Website roles. The backend enforces access; these only shape navigation and UI.
export type Role = 'admin' | 'manager' | 'trainer' | 'member';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  trainer: 'Trainer',
  member: 'Member',
};

/** Roles that use the admin panel. */
export const PANEL_ROLES: Role[] = ['admin', 'manager'];

/** Where each role lands after signing in. */
export function homeFor(role: Role | string | undefined): string {
  switch (role) {
    case 'admin':
    case 'manager':
      return '/admin/dashboard';
    case 'trainer':
      return '/trainer';
    case 'member':
      return '/member/dashboard';
    default:
      return '/login';
  }
}
