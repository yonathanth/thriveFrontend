// Display helpers shared by the notification bell and page.

const CHANGED = 'notifications:changed';

/** Tells the bell and the page that read state changed, so both show the same thing. */
export function notifyNotificationsChanged(): void {
  window.dispatchEvent(new Event(CHANGED));
}

export function onNotificationsChanged(listener: () => void): () => void {
  window.addEventListener(CHANGED, listener);
  return () => window.removeEventListener(CHANGED, listener);
}

export function notificationIcon(type: string): string {
  switch (type) {
    case 'payment':
      return 'payments';
    case 'payout_due':
      return 'account_balance_wallet';
    case 'package_changed':
      return 'swap_horiz';
    case 'start_date_changed':
    case 'plan_changed':
      return 'event_repeat';
    case 'expiring_summary':
    case 'membership_expiring':
      return 'hourglass_bottom';
    case 'membership_expired':
      return 'event_busy';
    case 'payment_received':
      return 'receipt_long';
    case 'freeze_changed':
      return 'ac_unit';
    case 'progress_check_due':
      return 'monitor_weight';
    case 'message':
      return 'campaign';
    case 'client_digest':
      return 'groups';
    default:
      return 'notifications';
  }
}

export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const mins = Math.floor((now - then) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Where each role reads its notifications. */
export function notificationsPath(role: string | undefined): string {
  return role === 'trainer' ? '/trainer/notifications' : role === 'member' ? '/member/notifications' : '/admin/notifications';
}
