import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyLog } from '../../models/allergy-track.model';

export interface PersistenceAdapter {
  getDailyLogs(profileId: string, startDate?: string, endDate?: string): Observable<DailyLog[]>;
  getDailyLog(profileId: string, date: string): Observable<DailyLog | null>;
  saveDailyLog(log: DailyLog): Observable<DailyLog>;
  getPaginatedDailyLogs(profileId: string, page: number, perPage: number): Observable<{ items: DailyLog[], totalItems: number }>;
  getFirstEntryDate(profileId: string): Observable<string | null>;
}

export const PERSISTENCE_ADAPTER = new InjectionToken<PersistenceAdapter>('PERSISTENCE_ADAPTER');
