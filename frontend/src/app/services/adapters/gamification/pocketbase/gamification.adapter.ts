import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GamificationData } from '../../../../models/allergy-track.model';
import { GamificationAdapter } from '../../../gamification.interface';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseGamificationAdapter implements GamificationAdapter {
  private apiUrl = '/api/collections/gamification/records';
  private http = inject(HttpClient);

  getGamificationData(profileId: string): Observable<GamificationData | null> {
    const params = {
      filter: `profileId='${profileId}'`,
      perPage: '1'
    };

    return this.http.get<{ items: GamificationData[] }>(this.apiUrl, { params }).pipe(
      map(response => response.items.length > 0 ? response.items[0] : null),
      catchError(() => of(null))
    );
  }

  saveGamificationData(data: GamificationData): Observable<GamificationData> {
    if (data.id) {
      return this.http.patch<GamificationData>(`${this.apiUrl}/${data.id}`, data);
    } else {
      return this.http.post<GamificationData>(this.apiUrl, data);
    }
  }
}
