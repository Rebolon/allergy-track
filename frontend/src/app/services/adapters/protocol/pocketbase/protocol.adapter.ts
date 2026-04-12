import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ProtocolAdapter, ProtocolItem, SymptomItem } from '../../../protocol.interface';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseProtocolAdapter implements ProtocolAdapter {
  private apiUrl = '/api/collections/profiles_config/records';
  private http = inject(HttpClient);

  private getConfig(profileId: string): Observable<any> {
    const params = { filter: `profileId='${profileId}'` };
    return this.http.get<{ items: any[] }>(this.apiUrl, { params }).pipe(
      map(res => res.items.length > 0 ? res.items[0] : null)
    );
  }

  private upsertConfig(profileId: string, data: any): Observable<void> {
    return this.getConfig(profileId).pipe(
      switchMap(existing => {
        if (existing) {
          return this.http.patch(`${this.apiUrl}/${existing.id}`, data);
        } else {
          return this.http.post(this.apiUrl, { profileId, ...data });
        }
      }),
      map(() => undefined),
      catchError(err => {
        console.error('[PocketbaseProtocolAdapter] Upsert failed', err);
        return of(undefined);
      })
    );
  }

  getProtocols(profileId: string): Observable<ProtocolItem[]> {
    return this.getConfig(profileId).pipe(
      map(config => config?.protocols || []),
      catchError(() => of([]))
    );
  }

  saveProtocols(profileId: string, protocols: ProtocolItem[]): Observable<void> {
    return this.upsertConfig(profileId, { protocols });
  }

  getProtocolStartDate(profileId: string): Observable<string | null> {
    return this.getConfig(profileId).pipe(
      map(config => config?.startDate || null),
      catchError(() => of(null))
    );
  }

  saveProtocolStartDate(profileId: string, date: string | null): Observable<void> {
    return this.upsertConfig(profileId, { startDate: date });
  }

  getSymptoms(profileId: string): Observable<SymptomItem[]> {
    return this.getConfig(profileId).pipe(
      map(config => config?.symptoms || []),
      catchError(() => of([]))
    );
  }

  saveSymptoms(profileId: string, symptoms: SymptomItem[]): Observable<void> {
    return this.upsertConfig(profileId, { symptoms });
  }
}
