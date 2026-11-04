'use client';

import NotificationsView from '@/components/notifications/NotificationsView';
import SendNotificationPanel from '@/components/notifications/SendNotificationPanel';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const canSend = user?.role === 'admin' || user?.role === 'manager';
  return <NotificationsView>{canSend && <SendNotificationPanel />}</NotificationsView>;
}
