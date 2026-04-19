import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { GamificationData } from '../../../../models/allergy-track.model';
import { GamificationAdapter } from '../../../gamification.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageGamificationAdapter implements GamificationAdapter {
  private readonly GAMIFICATION_KEY = 'allergy_track_gamification';
  private platformId = inject(PLATFORM_ID);

  private getData(): GamificationData[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.GAMIFICATION_KEY);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  private setData(data: GamificationData[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.GAMIFICATION_KEY, JSON.stringify(data));
    }
  }

  getGamificationData(profileId: string): Observable<GamificationData | null> {
    const data = this.getData();
    const item = data.find(d => d.profileId === profileId) || null;
    return of(item);
  }

  saveGamificationData(data: GamificationData): Observable<GamificationData> {
    const allData = this.getData();
    const index = allData.findIndex(d => d.profileId === data.profileId);
    if (index >= 0) {
      allData[index] = { ...allData[index], ...data };
    } else {
      if (!data.id) data.id = Math.random().toString(36).substring(2, 17);
      allData.push(data);
    }
    this.setData(allData);
    return of(data);
  }
}
