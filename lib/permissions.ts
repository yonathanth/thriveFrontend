// Website permission keys. The API works out each account's permissions and enforces
// them; the website only uses them to decide what to show. Keep in step with
// thriveBackend/src/auth/permissions.ts.
export type Permission =
  | 'dashboard.operational'
  | 'dashboard.business'
  | 'members.view'
  | 'members.stats.view'
  | 'members.contact.view'
  | 'members.health.view'
  | 'members.payments.view'
  | 'members.progress.edit'
  | 'services.view'
  | 'catalog.money.view'
  | 'attendance.view'
  | 'staff.view'
  | 'staff.contact.view'
  | 'prospects.view'
  | 'finance.view'
  | 'finance.export'
  | 'online_payments.view'
  | 'finance.settings'
  | 'payroll.view'
  | 'payroll.manage'
  | 'payslip.own'
  | 'inventory.view'
  | 'inventory.money.view'
  | 'accounts.view'
  | 'accounts.reset_password'
  | 'accounts.conflicts.resolve'
  | 'accounts.status'
  | 'accounts.create_admin'
  | 'accounts.permissions.manage'
  | 'sms.send'
  | 'sms.bulk'
  | 'sms.history.view'
  | 'notifications.send'
  | 'audit.view';

/** True when the account holds at least one of the permissions. */
export function hasAny(
  held: readonly string[] | undefined,
  wanted: Permission | Permission[],
): boolean {
  const list = Array.isArray(wanted) ? wanted : [wanted];
  return !!held && list.some((p) => held.includes(p));
}
