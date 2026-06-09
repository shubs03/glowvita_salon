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
    this.audioContext = null;
    this.listeners = [];
    this.swRegistration = null;

    if (typeof window !== 'undefined') {
      // Diagnostic tool for the user
      window.playAdminTestSound = () => {
        console.log('[Diagnostic] Manual sound test triggered');
        this.playNotificationSound();
      };
      
      window.getAdminNotificationStatus = () => ({
        permission: Notification.permission,
        hasMessaging: !!this.messaging,
        hasSW: !!this.swRegistration,
        listeners: this.listeners.length
      });

      this.initFirebase();
    }
  }

  async initFirebase() {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      this.messaging = getMessaging(app);

      const triggerSound = (payload) => {
        console.log('[NotificationManager] SIGNAL (ADMIN) -> Playing sound and notifying listeners', payload);
        this.playNotificationSound();
        
        this.listeners.forEach(callback => {
          try { callback(payload); } catch (e) { console.error('[NotificationManager] Listener error:', e); }
        });
      };

      // Listen for signals from Service Worker (Background)
      const soundChannel = new BroadcastChannel('notification_sound_channel');
      soundChannel.onmessage = (event) => {
        console.log('[NotificationManager] Received signal from BroadcastChannel:', event.data);
        if (event.data?.type === 'PLAY_SOUND') {
          triggerSound(event.data.payload || { from: 'SW_DIRECT_ADMIN' });
        }
      };

      // Listen for foreground messages
      onMessage(this.messaging, (payload) => {
        console.log('[NotificationManager] Received foreground message:', payload);
        triggerSound(payload);
      });

      // Prepare AudioContext on interaction
      const initAudio = async () => {
        if (!this.audioContext) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.audioContext = new AudioCtx();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
          console.log('[Audio] Admin System Ready (AudioContext resumed)');
        }
      };

      ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt =>
        window.addEventListener(evt, initAudio, { passive: true, once: false })
      );

      // Register Service Worker and wait for it
      if ('serviceWorker' in navigator) {
        this.swRegistration = await navigator.serviceWorker.register('/api/firebase-messaging-sw', { scope: '/' });
        console.log('[System] Admin Service Registered');
      }
    } catch (err) {
      console.error('[NotificationManager] Admin Init error:', err);
    }
  }

  async playNotificationSound() {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.audioContext = new AudioCtx();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // Professional Double Beep
      const playBeep = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      playBeep(880, now, 0.3); // High A
      playBeep(660, now + 0.15, 0.4); // E
    } catch (err) {
      console.error('[Audio] Admin Play Error:', err);
    }
  }

  onMessageListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async requestPermission() {
    try {
      if (!this.messaging) {
         console.warn('[NotificationManager] Messaging not initialized. Retrying init...');
         await this.initFirebase();
      }

      console.log('[NotificationManager] Requesting permission...');
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('[NotificationManager] Permission granted. Getting token...');
        
        // Wait for SW if not ready
        if (!this.swRegistration) {
           this.swRegistration = await navigator.serviceWorker.ready;
        }

        const token = await getToken(this.messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: this.swRegistration,
        });

        if (token) {
          console.log('[NotificationManager] Token obtained. Registering with server...');
          await this.saveTokenToServer(token);
          return token;
        } else {
          console.warn('[NotificationManager] Failed to get FCM token');
        }
      } else {
        console.warn('[NotificationManager] Permission denied:', permission);
      }
    } catch (error) {
       console.error('[NotificationManager] requestPermission Error:', error);
       if (!VAPID_KEY) console.error('[NotificationManager] CRITICAL: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing!');
    }
    return null;
  }

  async saveTokenToServer(token) {
    try {
      const response = await fetch('/api/admin/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log('[NotificationManager] Admin Server Registration Success');
      } else {
        console.error('[NotificationManager] Admin Server Registration Failed:', data.message);
      }
    } catch (error) {
       console.error('[NotificationManager] saveTokenToServer Error:', error);
    }
  }
}

export default new NotificationManager();
