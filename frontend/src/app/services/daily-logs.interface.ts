import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyLog } from '../models/allergy-track.model';

export interface DailyLogsAdapter {
  getDailyLogs(profileId: string, startDate?: string, endDate?: string): Observable<DailyLog[]>;
  getDailyLog(profileId: string, date: string): Observable<DailyLog | null>;
  saveDailyLog(log: DailyLog): Observable<DailyLog>;
  getPaginatedDailyLogs(profileId: string, page: number, perPage: number): Observable<{ items: DailyLog[], totalItems: number }>;
  getFirstEntryDate(profileId: string): Observable<string | null>;
}

export const DAILY_LOGS_ADAPTER = new InjectionToken<DailyLogsAdapter>('DAILY_LOGS_ADAPTER');
