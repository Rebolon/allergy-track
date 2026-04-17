import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap, tap, shareReplay } from 'rxjs/operators';
import { ProtocolAdapter, ProtocolItem, SymptomItem, MedicsShieldItem } from '../../../protocol.interface';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseProtocolAdapter implements ProtocolAdapter {
  private apiUrl = '/api/collections/profiles_config/records';
  private http = inject(HttpClient);

  private configCache = new Map<string, Observable<any>>();

  private getConfig(profileId: string): Observable<any> {
    if (!profileId) return of(null);

    let obs = this.configCache.get(profileId);
    if (!obs) {
      const params = { filter: `profileId='${profileId}'` };
      obs = this.http.get<{ items: any[] }>(this.apiUrl, { params }).pipe(
        map(res => res.items.length > 0 ? res.items[0] : null),
        shareReplay(1),
        catchError(err => {
          this.configCache.delete(profileId);
          return throwError(() => err);
        })
      );
      this.configCache.set(profileId, obs);
    }
    return obs;
  }

  private upsertConfig(profileId: string, data: any): Observable<void> {
    if (!profileId) return throwError(() => new Error('ProfileId is required for upsert'));
    return this.getConfig(profileId).pipe(
      switchMap(existing => {
        if (existing) {
          return this.http.patch(`${this.apiUrl}/${existing.id}`, data);
        } else {
          return this.http.post(this.apiUrl, { profileId, ...data });
        }
      }),
      tap(saved => {
        // @todo j'ai un doute sur l'intérêt du shareReplay ici, à vérifier
        if (saved) this.configCache.set(profileId, of(saved).pipe(shareReplay(1)));
      }),
      map(() => undefined),
      catchError(err => {
        console.error('[PocketbaseProtocolAdapter] Upsert failed', err);
        return throwError(() => err);
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

  getMedicsShields(profileId: string): Observable<MedicsShieldItem[]> {
    return this.getConfig(profileId).pipe(
      map(config => config?.medicsShields || []),
      catchError(() => of([]))
    );
  }

  saveMedicsShields(profileId: string, medicsShields: MedicsShieldItem[]): Observable<void> {
    return this.upsertConfig(profileId, { medicsShields });
  }

  saveFullConfig(profileId: string, config: any): Observable<void> {
    return this.upsertConfig(profileId, config);
  }

  getFullConfig(profileId: string): Observable<{
    protocols: ProtocolItem[];
    startDate: string | null;
    symptoms: SymptomItem[];
    medicsShields: MedicsShieldItem[];
  }> {
    return this.getConfig(profileId).pipe(
      map(config => ({
        protocols: config?.protocols || [],
        startDate: config?.startDate || null,
        symptoms: config?.symptoms || [],
        medicsShields: config?.medicsShields || []
      })),
      catchError(() => of({
        protocols: [],
        startDate: null,
        symptoms: [],
        medicsShields: []
      }))
    );
  }
}
