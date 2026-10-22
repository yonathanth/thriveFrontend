/* Admin push notifications. Registered by lib/push.ts with scope /admin/. */

self.addEventListener('install', () => {
  // A new version takes over at once; it only handles pushes, so nothing to migrate.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let message = {};
  try {
    message = event.data ? event.data.json() : {};
  } catch {
    message = { body: event.data ? event.data.text() : '' };
  }

  const title = message.title || 'New notification';
  const url = message.url || '/admin/notifications';
  const options = {
    body: message.body || '',
    tag: message.tag || undefined,
    timestamp: message.timestamp || Date.now(),
    icon: '/favicon/android-chrome-192x192.png',
    badge: '/favicon/favicon-32x32.png',
    data: { url, notificationId: message.notificationId || null },
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Open admin pages refresh their notification bell right away.
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((windows) => windows.forEach((w) => w.postMessage({ type: 'notification', message }))),
    ]),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL(data.url || '/admin/notifications', self.location.origin);
  // The page marks it read: the service worker has no sign-in to do it with.
  if (data.notificationId) target.searchParams.set('notification', String(data.notificationId));

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const admin = windows.find((w) => new URL(w.url).pathname.startsWith('/admin'));
      if (admin) {
        await admin.focus();
        if ('navigate' in admin) return admin.navigate(target.href);
        return undefined;
      }
      return self.clients.openWindow(target.href);
    })(),
  );
});
