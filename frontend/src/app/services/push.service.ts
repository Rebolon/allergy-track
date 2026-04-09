import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface VapidKeys {
  publicKey: string;
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PushService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private pushApiUrl = '/api/push';

  private registration: ServiceWorkerRegistration | null = null;

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/push-sw.js');
        console.log('[Push] Service Worker registered');
      } catch (err) {
        console.error('[Push] SW registration failed:', err);
      }
    }
  }

  async isSupported(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async getPermissionStatus(): Promise<NotificationPermission | 'unsupported'> {
    if (!await this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  async subscribe(userId: string): Promise<boolean> {
    if (!await this.isSupported()) {
      console.warn('[Push] Push not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[Push] Permission denied');
        return false;
      }
    }

    try {
      const reg = this.registration || await navigator.serviceWorker.ready;
      const { publicKey } = await firstValueFrom(this.http.get<VapidKeys>(`${this.pushApiUrl}/vapidPublicKey`));

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      const subJson = subscription.toJSON() as PushSubscriptionJSON;

      await firstValueFrom(this.http.post(`${this.pushApiUrl}/subscribe`, {
        userId,
        subscription: {
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          expirationTime: subJson.expirationTime
        }
      }));

      console.log('[Push] Subscribed successfully');
      return true;
    } catch (err) {
      console.error('[Push] Subscription failed:', err);
      return false;
    }
  }

  async unsubscribe(userId: string): Promise<void> {
    try {
      const reg = this.registration || await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        await firstValueFrom(this.http.post(`${this.pushApiUrl}/unsubscribe`, {
          userId,
          endpoint: subscription.endpoint
        }));
        await subscription.unsubscribe();
        console.log('[Push] Unsubscribed successfully');
      }
    } catch (err) {
      console.error('[Push] Unsubscription failed:', err);
    }
  }

  async sendToUser(userId: string, payload: { title: string; body: string; icon?: string }): Promise<number> {
    const response = await firstValueFrom(this.http.post<{ sent: number }>(`${this.pushApiUrl}/send`, {
      userId,
      payload
    }));
    return response.sent;
  }

  async broadcast(payload: { title: string; body: string; icon?: string }): Promise<number> {
    const response = await firstValueFrom(this.http.post<{ sent: number }>(`${this.pushApiUrl}/broadcast`, { payload }));
    return response.sent;
  }

  private urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
  }
}
