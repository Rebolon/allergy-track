import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyLog } from '../../models/allergy-track.model';

export interface PersistenceAdapter {
  getDailyLogs(startDate?: string, endDate?: string): Observable<DailyLog[]>;
  getDailyLog(date: string): Observable<DailyLog | null>;
  saveDailyLog(log: DailyLog): Observable<DailyLog>;
  getPaginatedDailyLogs(page: number, perPage: number): Observable<{ items: DailyLog[], totalItems: number }>;
  getFirstEntryDate(): Observable<string | null>;
}

export const PERSISTENCE_ADAPTER = new InjectionToken<PersistenceAdapter>('PERSISTENCE_ADAPTER');
