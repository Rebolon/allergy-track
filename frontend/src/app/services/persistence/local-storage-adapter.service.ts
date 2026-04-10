import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { PersistenceAdapter } from './persistence.interface';
import { DailyLog } from '../../models/allergy-track.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageAdapterService implements PersistenceAdapter {
  private readonly DAILY_LOGS_KEY = 'allergy_track_daily_logs';
  private platformId = inject(PLATFORM_ID);

  private getLogs<T>(key: string): T[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  private setLogs<T>(key: string, logs: T[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(logs));
    }
  }

  getDailyLogs(startDate?: string, endDate?: string): Observable<DailyLog[]> {
    let logs = this.getLogs<DailyLog>(this.DAILY_LOGS_KEY);
    if (startDate) {
      logs = logs.filter(log => log.date >= startDate);
    }
    if (endDate) {
      logs = logs.filter(log => log.date <= endDate);
    }
    return of(logs);
  }

  getDailyLog(date: string): Observable<DailyLog | null> {
    const logs = this.getLogs<DailyLog>(this.DAILY_LOGS_KEY);
    const dateLogs = logs.filter(l => l.date === date);
    const log = dateLogs.length > 0 ? dateLogs[dateLogs.length - 1] : null;
    return of(log);
  }

  saveDailyLog(log: DailyLog): Observable<DailyLog> {
    const logs = this.getLogs<DailyLog>(this.DAILY_LOGS_KEY);
    const index = logs.findIndex(l => l.date === log.date);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    this.setLogs(this.DAILY_LOGS_KEY, logs);
    return of(log);
  }

  getPaginatedDailyLogs(page: number, perPage: number): Observable<{ items: DailyLog[], totalItems: number }> {
    const logs = this.getLogs<DailyLog>(this.DAILY_LOGS_KEY).sort((a, b) => b.date.localeCompare(a.date));
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return of({
      items: logs.slice(start, end),
      totalItems: logs.length
    });
  }

  getFirstEntryDate(): Observable<string | null> {
    const logs = this.getLogs<DailyLog>(this.DAILY_LOGS_KEY);
    if (logs.length === 0) return of(null);
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    return of(sorted[0].date);
  }
}
