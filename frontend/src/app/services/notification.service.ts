import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageAdapterService } from './persistence/local-storage-adapter.service';
import { PushService } from './push.service';
import { DailyLog } from '../models/allergi-track.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private persistence = inject(LocalStorageAdapterService);
  private pushService = inject(PushService);
  private platformId = inject(PLATFORM_ID);

  private checkIntervalId: ReturnType<typeof setInterval> | null = null;

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    await this.pushService.init();

    const supported = await this.pushService.isSupported();
    if (!supported) {
      console.warn('[Notification] Push notifications not supported');
      return;
    }

    const permission = await this.pushService.getPermissionStatus();
    if (permission === 'unsupported') {
      console.warn('[Notification] Notifications not supported');
      return;
    }

    if (permission !== 'granted' && permission !== 'denied') {
      Notification.requestPermission();
    }

    this.startDailyCheck();
  }

  async subscribe(userId: string): Promise<boolean> {
    return this.pushService.subscribe(userId);
  }

  async unsubscribe(userId: string): Promise<void> {
    return this.pushService.unsubscribe(userId);
  }

  async sendReminder(userId: string, message: string): Promise<number> {
    return this.pushService.sendToUser(userId, {
      title: 'AllergyTrack - Rappel',
      body: message,
      icon: '/icons/icon-192x192.png'
    });
  }

  private startDailyCheck(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }

    this.checkIntervalId = setInterval(() => this.checkAndNotify(), 60 * 60 * 1000);
    this.checkAndNotify();
  }

  private async checkAndNotify(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours === 20 && minutes < 5) {
      const today = now.toISOString().split('T')[0];
      
      const log = await new Promise<DailyLog | null>((resolve) => {
        this.persistence.getDailyLog(today).subscribe(resolve);
      });

      if (!log || log.intakes.some((i) => !i.taken)) {
        console.log('[Notification] Sending daily reminder push');
      }
    }
  }
}
