import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

class NotificationManager {
  constructor() {
    this.messaging = null;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      this.messaging = getMessaging(app);
      // Register the SW from the dynamic route (so it gets real env values)
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((reg) => console.log('[Web] Firebase SW registered:', reg.scope))
        .catch((err) => console.error('[Web] Firebase SW registration failed:', err));
    }
  }

  async requestPermission() {
    try {
      if (!this.messaging) return null;

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js'),
        });
        
        if (token) {
          console.log('FCM Token generated:', token);
          await this.saveTokenToServer(token);
          return token;
        }
      } else {
        console.warn('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
    return null;
  }

  async saveTokenToServer(token) {
    try {
      const response = await fetch('/api/client/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      if (response.status === 401) {
        console.log('User not logged in, skipping FCM token registration.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to register FCM token on server');
      }
      console.log('FCM Token registered on server successfully.');
    } catch (error) {
      console.error('Error saving FCM token to server:', error);
    }
  }

  onMessageListener() {
    if (!this.messaging) return null;
    return new Promise((resolve) => {
      onMessage(this.messaging, (payload) => {
        console.log('Foreground Message received:', payload);
        resolve(payload);
      });
    });
  }
}

export default new NotificationManager();
