// Web Push for the admin: one subscription per browser, saved on the server for the
// signed-in admin. The service worker (public/sw.js) shows what arrives.
import { pushApi, NotificationType } from './api';

const SW_URL = '/sw.js';
const SW_SCOPE = '/admin/';
/** Set while this browser should be subscribed, so a lost subscription is restored. */
const WANTED_KEY = 'pushWanted';

export type PushSupport =
  | 'supported'
  /** iPhone/iPad Safari: push works only from the site added to the Home Screen */
  | 'needs-install'
  | 'unsupported';

export function pushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (ios && !standalone) return 'needs-install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported';
  }
  return 'supported';
}

function base64UrlToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  if (existing) return existing;
  await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  return navigator.serviceWorker.ready;
}

/** The browser's current subscription, if any. */
export async function currentSubscription(): Promise<PushSubscription | null> {
  if (pushSupport() !== 'supported') return null;
  const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  return reg ? reg.pushManager.getSubscription() : null;
}

function setWanted(wanted: boolean) {
  try {
    if (wanted) localStorage.setItem(WANTED_KEY, '1');
    else localStorage.removeItem(WANTED_KEY);
  } catch {
    // Private mode: the subscription still works, it just is not restored if lost.
  }
}

function isWanted(): boolean {
  try {
    return localStorage.getItem(WANTED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Asks for permission, subscribes this browser, and registers it with the server. */
export async function enablePush(types?: NotificationType[]): Promise<PushSubscription> {
  if (pushSupport() !== 'supported') throw new Error('This browser cannot receive push notifications');
  const config = await pushApi.getConfig();
  if (!config.enabled || !config.publicKey) {
    throw new Error('Push notifications are not set up on the server yet');
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked for this site. Allow them in the browser settings, then try again.'
        : 'Notification permission was not given',
    );
  }

  const reg = await registration();
  const key = base64UrlToBytes(config.publicKey);
  let sub = await reg.pushManager.getSubscription();
  // A subscription made with another server key cannot be used; start over.
  if (sub && sub.options.applicationServerKey) {
    const current = new Uint8Array(sub.options.applicationServerKey);
    if (current.length !== key.length || current.some((b, i) => b !== key[i])) {
      await sub.unsubscribe();
      sub = null;
    }
  }
  sub = sub ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }));
  await pushApi.subscribe(sub.toJSON(), types);
  setWanted(true);
  return sub;
}

/** Unsubscribes this browser here and on the server. */
export async function disablePush(authToken?: string): Promise<void> {
  setWanted(false);
  const sub = await currentSubscription();
  if (!sub) return;
  try {
    await pushApi.unsubscribe(sub.endpoint, authToken);
  } finally {
    await sub.unsubscribe();
  }
}

/**
 * Called on sign-out: this browser must stop receiving the admin's notifications
 * before the next person uses it. Takes the token because sign-out clears it at once.
 * Best effort; never blocks signing out.
 */
export async function disablePushOnSignOut(authToken: string | null): Promise<void> {
  try {
    await disablePush(authToken ?? undefined);
  } catch {
    // The server may be unreachable; the browser side is already unsubscribed.
  }
}

/**
 * Keeps a wanted subscription alive: re-registers it with the server (which may have
 * dropped it) and resubscribes if the browser rotated or lost it. Silent on failure.
 */
export async function restorePush(): Promise<void> {
  if (!isWanted() || pushSupport() !== 'supported' || Notification.permission !== 'granted') return;
  try {
    const sub = await currentSubscription();
    if (sub) await pushApi.subscribe(sub.toJSON());
    else await enablePush();
  } catch {
    // Tried again on the next page load.
  }
}
