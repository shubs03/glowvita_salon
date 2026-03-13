/**
 * This service worker bootstraps itself by fetching the real Firebase config
 * from the server-side API route, which injects the actual environment values.
 *
 * This avoids hardcoding Firebase credentials in a public static file.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/api/firebase-messaging-sw')
      .then((res) => res.text())
      .then((code) => {
        // eslint-disable-next-line no-eval
        eval(code);
      })
      .catch((err) => console.error('[SW Bootstrap] Failed to load Firebase config:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
