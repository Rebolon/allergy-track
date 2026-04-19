import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { GamificationData } from '../models/allergy-track.model';

export interface GamificationAdapter {
  getGamificationData(profileId: string): Observable<GamificationData | null>;
  saveGamificationData(data: GamificationData): Observable<GamificationData>;
}

export const GAMIFICATION_ADAPTER = new InjectionToken<GamificationAdapter>('GAMIFICATION_ADAPTER');
