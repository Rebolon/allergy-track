import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DailyLog } from '../../models/allergi-track.model';
import { PersistenceAdapter } from './persistence.interface';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseAdapterService implements PersistenceAdapter {
  // Since the frontend runs from PocketBase's static server, relative paths hit its own API.
  private apiUrl = '/api/collections';
  private http = inject(HttpClient);

  getDailyLogs(startDate?: string, endDate?: string): Observable<DailyLog[]> {
    let filter = '';
    if (startDate && endDate) {
      filter = `date >= '${startDate}' && date <= '${endDate}'`;
    } else if (startDate) {
      filter = `date >= '${startDate}'`;
    } else if (endDate) {
      filter = `date <= '${endDate}'`;
    }

    const params: Record<string, string | number | boolean | readonly (string | number | boolean)[]> = { 
      sort: '-date,-created',
      filter: filter
    };
    
    return this.http.get<{ items: DailyLog[] }>(`${this.apiUrl}/daily_logs/records`, { params })
      .pipe(map(response => response.items.map(item => ({ ...item, id: item.externalId || item.id }))));
  }

  getDailyLog(date: string): Observable<DailyLog | null> {
    const filter = `date='${date}'`;
    const params = { filter, sort: '-created' }; // Get most recent entry for that day
    return this.http.get<{ items: DailyLog[] }>(`${this.apiUrl}/daily_logs/records`, { params })
      .pipe(map(response => response.items.length > 0 ? ({ ...response.items[0], id: response.items[0].externalId || response.items[0].id }) : null));
  }

  saveDailyLog(log: DailyLog): Observable<DailyLog> {
    const { id, ...data } = log;
    const payload = { ...data, externalId: id };
    return this.http.post<DailyLog>(`${this.apiUrl}/daily_logs/records`, payload)
      .pipe(map(response => ({ ...response, id: response['externalId'] } as DailyLog)));
  }

  getPaginatedDailyLogs(page: number, perPage: number): Observable<{ items: DailyLog[], totalItems: number }> {
    const params = {
      page: page.toString(),
      perPage: perPage.toString(),
      sort: '-date,-created'
    };

    return this.http.get<{ items: DailyLog[], totalItems: number }>(`${this.apiUrl}/daily_logs/records`, { params })
      .pipe(map(response => ({
        items: response.items.map(item => ({ ...item, id: item.externalId || item.id })),
        totalItems: response.totalItems
      })));
  }
}
