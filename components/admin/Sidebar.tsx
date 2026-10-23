'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, Role } from '@/lib/roles';
import AppSidebar, { SidebarItem, SidebarSection, UserAvatar } from '@/components/layout/AppSidebar';

interface NavItem extends SidebarItem {
  /** Who sees the link; defaults to admins and managers. The API enforces the same. */
  roles?: Role[];
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
      { name: 'Notifications', href: '/admin/notifications', icon: 'notifications' },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Members', href: '/admin/members', icon: 'group' },
      { name: 'Attendance', href: '/admin/attendance', icon: 'fact_check' },
      { name: 'Staff', href: '/admin/staff', icon: 'badge' },
      { name: 'Potential Customers', href: '/admin/potential-customers', icon: 'person_add' },
    ],
  },
  {
    label: 'Business',
    items: [
      { name: 'Transactions', href: '/admin/transactions', icon: 'payments', roles: ['admin'] },
      { name: 'Services', href: '/admin/services', icon: 'category' },
      { name: 'Catalog', href: '/admin/catalog', icon: 'inventory_2' },
      { name: 'Inventory', href: '/admin/inventory', icon: 'warehouse', exact: true },
      { name: 'Inventory Sales', href: '/admin/inventory/sales', icon: 'point_of_sale', roles: ['admin'] },
      { name: 'Schedule', href: '/admin/schedule', icon: 'calendar_month' },
      { name: 'SMS', href: '/admin/sms', icon: 'sms' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Accounts', href: '/admin/accounts', icon: 'manage_accounts' },
      { name: 'Audit Log', href: '/admin/audit-log', icon: 'history', roles: ['admin'] },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const sections: SidebarSection[] = navSections
    .map((s) => ({
      label: s.label,
      items: s.items.filter((item) => !!user && (item.roles ?? ['admin', 'manager']).includes(user.role)),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <AppSidebar
      sections={sections}
      subtitle={user?.role === 'manager' ? 'Manager Panel' : 'Admin Panel'}
      homeHref="/admin/dashboard"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        user && (
          <div className="flex items-center gap-3 rounded-lg bg-white/3 px-3 py-2.5">
            <UserAvatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-white/40">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        )
      }
    />
  );
}
