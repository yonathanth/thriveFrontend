'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { notificationsApi, AppNotification } from '@/lib/api';
import { restorePush } from '@/lib/push';
import { notificationIcon, notifyNotificationsChanged, onNotificationsChanged, timeAgo } from '@/lib/notifications';

const POLL_MS = 30_000;

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const refreshCount = useCallback(async () => {
    try {
      setCount((await notificationsApi.unreadCount()).count);
    } catch {
      // Shown again on the next poll.
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await notificationsApi.list({ limit: 8 })).data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // A wanted push subscription the browser or server lost is restored once per visit.
  useEffect(() => {
    restorePush();
  }, []);

  // The push handler reads the latest open state without re-subscribing on each toggle.
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Poll while the tab is visible, refresh when it comes back, and at once when a push arrives.
  useEffect(() => {
    refreshCount();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshCount();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && refreshCount();
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'notification') {
        refreshCount();
        if (openRef.current) loadItems();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    navigator.serviceWorker?.addEventListener('message', onMessage);
    const offChanged = onNotificationsChanged(refreshCount);
    return () => {
      clearInterval(timer);
      offChanged();
      document.removeEventListener('visibilitychange', onVisible);
      navigator.serviceWorker?.removeEventListener('message', onMessage);
    };
  }, [refreshCount, loadItems]);

  // Arriving from a clicked push: that notification has been seen.
  const fromPush = searchParams.get('notification');
  useEffect(() => {
    const id = Number(fromPush);
    if (!fromPush || !Number.isInteger(id)) return;
    notificationsApi.markRead([id]).then(notifyNotificationsChanged).catch(() => undefined);
  }, [fromPush, refreshCount]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadItems();
  };

  const openItem = async (n: AppNotification) => {
    setOpen(false);
    if (!n.read) {
      setCount((c) => Math.max(0, c - 1));
      notificationsApi.markRead([n.id]).then(notifyNotificationsChanged).catch(() => undefined);
    }
    router.push(n.url);
  };

  const markAll = async () => {
    try {
      await notificationsApi.markAllRead();
      setCount(0);
      notifyNotificationsChanged();
      setItems((list) => list?.map((n) => ({ ...n, read: true })) ?? null);
    } catch {
      // Left unread; the user can try again.
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2 rounded-lg text-white/60 hover:bg-surface-dark-lighter hover:text-white transition-colors"
        aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-16 sm:top-auto sm:right-0 sm:mt-2 sm:w-96 bg-surface-dark border border-surface-dark-lighter rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-dark-lighter">
            <p className="text-white font-semibold">Notifications</p>
            {count > 0 && (
              <button onClick={markAll} className="text-primary text-xs font-medium hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-surface-dark-lighter">
            {loading && !items ? (
              <div className="p-6 text-center text-white/40 text-sm">Loading…</div>
            ) : !items || items.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm">No notifications yet</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-dark-lighter/50 transition-colors ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-primary mt-0.5">{notificationIcon(n.type)}</span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{n.title}</span>
                      {!n.read && <span className="size-2 rounded-full bg-primary shrink-0" />}
                    </span>
                    <span className="block text-white/60 text-sm line-clamp-2">{n.body}</span>
                    <span className="block text-white/30 text-xs mt-1">{timeAgo(n.occurredAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-3 text-sm text-primary border-t border-surface-dark-lighter hover:bg-surface-dark-lighter/50"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
