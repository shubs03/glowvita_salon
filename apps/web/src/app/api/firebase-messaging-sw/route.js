import {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@repo/config/config';
import { NextResponse } from 'next/server';

/**
 * This route serves the Firebase Messaging Service Worker as a JS file,
 * injecting the Firebase config at runtime so no hardcoding is needed.
 * The public/firebase-messaging-sw.js fetches this and evals it.
 */
export async function GET() {
  const swContent = `
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${FIREBASE_API_KEY}",
  authDomain: "${FIREBASE_PROJECT_ID}.firebaseapp.com",
  projectId: "${FIREBASE_PROJECT_ID}",
  storageBucket: "${FIREBASE_PROJECT_ID}.appspot.com",
  messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${FIREBASE_APP_ID}",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  const notificationTitle = payload.notification?.title || 'Glowvita';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/badge.png',
    data: payload.data || {},
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
`;

  return new NextResponse(swContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
