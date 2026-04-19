import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyLog } from '../models/allergy-track.model';
import { DAILY_LOGS_ADAPTER } from './daily-logs.interface';

@Injectable({
  providedIn: 'root'
})
export class DailyLogsService {
  private adapter = inject(DAILY_LOGS_ADAPTER);

  getDailyLogs(profileId: string, startDate?: string, endDate?: string): Observable<DailyLog[]> {
    return this.adapter.getDailyLogs(profileId, startDate, endDate);
  }

  getDailyLog(profileId: string, date: string): Observable<DailyLog | null> {
    return this.adapter.getDailyLog(profileId, date);
  }

  saveDailyLog(log: DailyLog): Observable<DailyLog> {
    return this.adapter.saveDailyLog(log);
  }

  getPaginatedDailyLogs(profileId: string, page: number, perPage: number): Observable<{ items: DailyLog[], totalItems: number }> {
    return this.adapter.getPaginatedDailyLogs(profileId, page, perPage);
  }

  getFirstEntryDate(profileId: string): Observable<string | null> {
    return this.adapter.getFirstEntryDate(profileId);
  }
}
