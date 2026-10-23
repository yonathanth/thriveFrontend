'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  notificationsApi,
  pushApi,
  AppNotification,
  NotificationType,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPES_BY_ROLE,
} from '@/lib/api';
import { currentSubscription, disablePush, enablePush, pushSupport, PushSupport } from '@/lib/push';
import { notificationIcon, notifyNotificationsChanged, onNotificationsChanged, timeAgo } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_SIZE = 20;

const SUBTITLES: Record<string, string> = {
  admin: 'Payments, membership changes and messages from the gym, as they happen',
  manager: 'Membership changes and messages from the gym, as they happen',
  trainer: 'Your clients to check on, and messages from the gym',
  member: 'Your membership, payments and messages from the gym',
};

/** What this account can receive; payment alerts are admin-only (the API enforces it). */
function useVisibleTypes(): NotificationType[] {
  const { user } = useAuth();
  return NOTIFICATION_TYPES_BY_ROLE[user?.role ?? ''] ?? [];
}

/**
 * The notifications page for every role. `children` goes above the list, for the
 * admin panel's message sender.
 */
export default function NotificationsView({ children }: { children?: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const visibleTypes = useVisibleTypes();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [type, setType] = useState<NotificationType | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await notificationsApi.list({
          page: nextPage,
          limit: PAGE_SIZE,
          unread: unreadOnly || undefined,
          type: type || undefined,
        });
        setItems((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.total);
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    },
    [unreadOnly, type]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  // A push arriving while this page is open shows up at the top, and read state
  // changed from the bell shows here too.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => e.data?.type === 'notification' && load(1);
    navigator.serviceWorker?.addEventListener('message', onMessage);
    const offChanged = onNotificationsChanged(() => load(1));
    return () => {
      navigator.serviceWorker?.removeEventListener('message', onMessage);
      offChanged();
    };
  }, [load]);

  const open = (n: AppNotification) => {
    if (!n.read) notificationsApi.markRead([n.id]).then(notifyNotificationsChanged).catch(() => undefined);
    // Personal notifications without a page of their own stay on this list.
    if (n.url) router.push(n.url);
  };

  const markAll = async () => {
    await notificationsApi.markAllRead();
    // Reloads this list too, through the change listener above.
    notifyNotificationsChanged();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Notifications</h1>
          <p className="text-white/60 mt-1">{SUBTITLES[user?.role ?? ''] ?? ''}</p>
        </div>
        <button
          onClick={markAll}
          className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white transition-colors self-start sm:self-auto"
        >
          Mark all read
        </button>
      </div>

      {children}

      <PushSettings />

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex rounded-lg bg-surface-dark-lighter p-1">
          {[false, true].map((u) => (
            <button
              key={String(u)}
              onClick={() => setUnreadOnly(u)}
              className={`px-4 h-8 rounded-md text-sm transition-colors ${
                unreadOnly === u ? 'bg-primary text-black font-medium' : 'text-white/60 hover:text-white'
              }`}
            >
              {u ? 'Unread' : 'All'}
            </button>
          ))}
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as NotificationType | '')}
          className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50"
        >
          <option value="">All types</option>
          {visibleTypes.map((t) => (
            <option key={t} value={t}>
              {NOTIFICATION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
        {error ? (
          <div className="p-12 text-center text-white/60">{error}</div>
        ) : items.length === 0 && !loading ? (
          <div className="p-12 text-center text-white/40">
            <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">notifications_off</span>
            {unreadOnly ? 'Nothing unread' : 'No notifications yet'}
          </div>
        ) : (
          <div className="divide-y divide-surface-dark-lighter">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => open(n)}
                className="w-full text-left p-4 flex gap-4 hover:bg-surface-dark-lighter/40 transition-colors"
              >
                <span
                  className={`size-10 shrink-0 rounded-full flex items-center justify-center ${
                    n.read ? 'bg-white/5 text-white/40' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined">{notificationIcon(n.type)}</span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`font-medium ${n.read ? 'text-white/70' : 'text-white'}`}>{n.title}</span>
                    {!n.read && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="block text-white/60 text-sm mt-0.5">{n.body}</span>
                </span>
                <span className="text-white/40 text-xs whitespace-nowrap" title={new Date(n.occurredAt).toLocaleString()}>
                  {timeAgo(n.occurredAt)}
                </span>
              </button>
            ))}
          </div>
        )}
        {items.length < total && (
          <button
            onClick={() => load(page + 1)}
            disabled={loading}
            className="w-full py-3 text-sm text-primary border-t border-surface-dark-lighter hover:bg-surface-dark-lighter/40 disabled:opacity-50"
          >
            {loading ? 'Loading…' : `Show more (${total - items.length} left)`}
          </button>
        )}
      </div>
    </div>
  );
}

/** This browser's push notifications: on/off, which kinds, and a test. */
function PushSettings() {
  const visibleTypes = useVisibleTypes();
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [serverEnabled, setServerEnabled] = useState<boolean | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [types, setTypes] = useState<NotificationType[]>(visibleTypes);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const s = pushSupport();
      setSupport(s);
      try {
        setServerEnabled((await pushApi.getConfig()).enabled);
      } catch {
        setServerEnabled(false);
      }
      if (s !== 'supported') return;
      const sub = await currentSubscription();
      if (!sub) return;
      try {
        const device = (await pushApi.devices()).find((d) => d.endpoint === sub.endpoint);
        if (device) {
          setEndpoint(sub.endpoint);
          setTypes(device.types);
        }
      } catch {
        // Shown as off; turning it on re-registers.
      }
    })();
  }, []);

  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      setMessage({ ok: true, text: await action() });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setBusy(false);
    }
  };

  const turnOn = () =>
    run(async () => {
      const sub = await enablePush(types);
      setEndpoint(sub.endpoint);
      return 'Push notifications are on for this device.';
    });

  const turnOff = () =>
    run(async () => {
      await disablePush();
      setEndpoint(null);
      return 'Push notifications are off for this device.';
    });

  const toggleType = (t: NotificationType) => {
    const next = types.includes(t) ? types.filter((x) => x !== t) : [...types, t];
    setTypes(next);
    if (endpoint) {
      run(async () => {
        await pushApi.setTypes(endpoint, next);
        return 'Saved.';
      });
    }
  };

  const test = () =>
    run(async () => {
      if (!endpoint) throw new Error('Turn push notifications on first');
      const result = await pushApi.test(endpoint);
      if (result.sent === 0) throw new Error('The test could not be delivered. Try turning push off and on again.');
      return 'Test sent. It should appear in a few seconds.';
    });

  if (support === null || serverEnabled === null) return null;

  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">phonelink_ring</span>
          <div>
            <h2 className="text-white font-semibold">Push notifications on this device</h2>
            <p className="text-white/60 text-sm mt-1">
              {!serverEnabled
                ? 'Push is not set up on the server yet. Notifications still appear here.'
                : support === 'needs-install'
                  ? 'On iPhone and iPad, add this site to the Home Screen (Share → Add to Home Screen), open it from there, then turn push on.'
                  : support === 'unsupported'
                    ? 'This browser cannot receive push notifications.'
                    : endpoint
                      ? 'On. You will be notified even when this site is closed.'
                      : 'Off. Turn on to be notified even when this site is closed.'}
            </p>
          </div>
        </div>
        {serverEnabled && support === 'supported' && (
          <div className="flex gap-2 shrink-0">
            {endpoint && (
              <button
                onClick={test}
                disabled={busy}
                className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white disabled:opacity-50"
              >
                Send test
              </button>
            )}
            <button
              onClick={endpoint ? turnOff : turnOn}
              disabled={busy}
              className={`h-10 px-4 rounded-lg font-medium disabled:opacity-50 ${
                endpoint ? 'bg-surface-dark-lighter text-white/80 hover:text-white' : 'bg-primary text-black hover:bg-primary/90'
              }`}
            >
              {busy ? 'Working…' : endpoint ? 'Turn off' : 'Turn on'}
            </button>
          </div>
        )}
      </div>

      {serverEnabled && support === 'supported' && (
        <div className="mt-4 pt-4 border-t border-surface-dark-lighter flex flex-wrap gap-x-6 gap-y-2">
          {visibleTypes.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={types.includes(t)}
                onChange={() => toggleType(t)}
                disabled={busy}
                className="accent-primary size-4"
              />
              {NOTIFICATION_TYPE_LABELS[t]}
            </label>
          ))}
        </div>
      )}

      {message && (
        <p className={`mt-3 text-sm ${message.ok ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>
      )}
    </div>
  );
}
