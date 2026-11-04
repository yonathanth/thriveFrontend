'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, Role } from '@/lib/roles';
import type { Permission } from '@/lib/permissions';
import AppSidebar, { SidebarItem, SidebarSection, UserAvatar } from '@/components/layout/AppSidebar';

interface NavItem extends SidebarItem {
  /** Who sees the link; defaults to admins and managers. The API enforces the same. */
  roles?: Role[];
  /** Also needs one of these permissions. The API enforces the same. */
  permission?: Permission | Permission[];
  /** Only for logins that belong to a member of staff in the gym app */
  staffOnly?: boolean;
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard', permission: ['dashboard.operational', 'dashboard.business'] },
      { name: 'Notifications', href: '/admin/notifications', icon: 'notifications' },
      { name: 'My pay', href: '/admin/my-pay', icon: 'account_balance_wallet', staffOnly: true },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Members', href: '/admin/members', icon: 'group', permission: 'members.view' },
      { name: 'Attendance', href: '/admin/attendance', icon: 'fact_check', permission: 'attendance.view' },
      { name: 'Staff', href: '/admin/staff', icon: 'badge', permission: 'staff.view' },
      { name: 'Potential Customers', href: '/admin/potential-customers', icon: 'person_add', permission: 'prospects.view' },
    ],
  },
  {
    label: 'Business',
    items: [
      { name: 'Transactions', href: '/admin/transactions', icon: 'payments', permission: 'finance.view' },
      { name: 'Online Payments', href: '/admin/online-payments', icon: 'credit_card', permission: 'online_payments.view' },
      { name: 'Payroll', href: '/admin/payroll', icon: 'account_balance_wallet', roles: ['admin'] },
      { name: 'Services', href: '/admin/services', icon: 'category', permission: 'services.view' },
      { name: 'Catalog', href: '/admin/catalog', icon: 'inventory_2', permission: 'services.view' },
      { name: 'Inventory', href: '/admin/inventory', icon: 'warehouse', exact: true, permission: 'inventory.view' },
      { name: 'Inventory Sales', href: '/admin/inventory/sales', icon: 'point_of_sale', permission: 'inventory.money.view' },
      { name: 'Schedule', href: '/admin/schedule', icon: 'calendar_month', permission: 'staff.view' },
      { name: 'SMS', href: '/admin/sms', icon: 'sms', permission: ['sms.send', 'sms.bulk', 'sms.history.view'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Accounts', href: '/admin/accounts', icon: 'manage_accounts', permission: 'accounts.view' },
      { name: 'Audit Log', href: '/admin/audit-log', icon: 'history', roles: ['admin'] },
      { name: 'Settings', href: '/admin/settings', icon: 'settings', roles: ['admin'] },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { user, can } = useAuth();

  const sections: SidebarSection[] = navSections
    .map((s) => ({
      label: s.label,
      items: s.items.filter(
        (item) =>
          !!user &&
          (item.roles ?? ['admin', 'manager']).includes(user.role) &&
          (!item.permission || can(item.permission)) &&
          (!item.staffOnly || !!user.isStaff),
      ),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <AppSidebar
      sections={sections}
      subtitle={user?.role === 'manager' ? 'Manager Panel' : 'Admin Panel'}
      homeHref="/admin/dashboard"
      isOpen={isOpen}
      onClose={onClose}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      footer={
        user && (
          isCollapsed ? (
            <Link
              href="/admin/profile"
              onClick={onClose}
              className="flex items-center justify-center rounded-lg bg-white/3 p-2 transition-colors hover:bg-white/5"
              aria-label="Open your profile"
              title={user.name}
            >
              <UserAvatar name={user.name} />
            </Link>
          ) : (
            <Link
              href="/admin/profile"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg bg-white/3 px-3 py-2.5 transition-colors hover:bg-white/5"
              aria-label="Open your profile"
            >
              <UserAvatar name={user.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-white/40">{ROLE_LABELS[user.role]}</p>
              </div>
            </Link>
          )
        )
      }
    />
  );
}
