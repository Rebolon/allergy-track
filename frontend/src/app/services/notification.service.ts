import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PERSISTENCE_ADAPTER } from './persistence/persistence.interface';
import { DailyLog } from '../models/allergy-track.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private persistence = inject(PERSISTENCE_ADAPTER);
  private platformId = inject(PLATFORM_ID);
  private hasNotifiedToday = false;
  private intervalId: any | null = null;

  init() {
    if (isPlatformBrowser(this.platformId) && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }

      // Check every minute
      this.intervalId = setInterval(() => this.checkTime(), 60000);
      this.checkTime(); // Check immediately on load
    }
  }

  private checkTime() {
    const now = new Date();
    const hours = now.getHours();

    // Reset flag at midnight
    if (hours < 20) {
      this.hasNotifiedToday = false;
    }

    if (hours >= 20 && !this.hasNotifiedToday) {
      const today = now.toISOString().split('T')[0];
      this.persistence.getDailyLog(today).subscribe(log => {
        // If no log today, or if log exists but some intakes are not taken
        if (!log || log.intakes.some(i => !i.taken)) {
          this.sendNotification("N'oublie pas tes allergènes aujourd'hui ! 🥜");
          this.hasNotifiedToday = true;
        }
      });
    }
  }

  private sendNotification(message: string) {
    if (Notification.permission === 'granted') {
      new Notification('AllergiTrack', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }
}
