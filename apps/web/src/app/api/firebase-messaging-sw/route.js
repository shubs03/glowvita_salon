import {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@repo/config/config';
import { NextResponse } from 'next/server';

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
const soundChannel = new BroadcastChannel('notification_sound_channel');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// RAW PUSH - THE INSTANT BROADCASTER
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      const data = payload.data || payload; 
      const title = data.title || payload.notification?.title || 'Glowvita';
      const body = data.body || payload.notification?.body || '';
      
      // Send the FULL payload to all tabs for instant Bell Icon updates
      soundChannel.postMessage({ 
        type: 'PLAY_SOUND', 
        payload: { 
          notification: { title, body },
          data: data,
          from: 'SW_RAW'
        } 
      });

      const options = {
        body: body,
        icon: '/logo.png',
        badge: '/badge.png',
        data: data,
        tag: 'glowvita-priority-alert',
        renotify: true,
        requireInteraction: true
      };
      
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      console.log('[SW] Push signal received, triggering backup sound');
      soundChannel.postMessage({ type: 'PLAY_SOUND', from: 'SW_FALLBACK' });
    }
  }
});

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background arrival:', payload);
  const data = payload.data || {};
  const title = data.title || payload.notification?.title || 'Glowvita';
  const body = data.body || payload.notification?.body || '';
  
  // Forward everything to tabs instantly
  soundChannel.postMessage({ 
    type: 'PLAY_SOUND', 
    payload: {
      notification: { title, body },
      data: data,
      from: 'SW_FCM'
    }
  });

  const options = {
    body, icon: '/logo.png', badge: '/badge.png', data, tag: 'glowvita-priority-alert'
  };
  self.registration.showNotification(title, options);
});

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
