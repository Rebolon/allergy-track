import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { SharingAdapter, Invitation } from '../../../sharing.interface';
import { PermissionLevel } from '../../../../models/allergy-track.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseSharingAdapter implements SharingAdapter {
  private http = inject(HttpClient);
  private readonly AUTH_KEY = 'pocketbase_auth';

  createInvite(profileId: string, permission: PermissionLevel): Observable<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24h validity

    return this.http.post(`/api/collections/invitations/records`, {
      code,
      profileId,
      permission,
      expiresAt: expiresAt.toISOString()
    }).pipe(
      map(() => code)
    );
  }

  getInvite(code: string): Observable<Invitation | null> {
    return this.http.get<{ items: any[] }>(`/api/collections/invitations/records`, {
      params: { filter: `code="${code}"` }
    }).pipe(
      map(res => {
        const invite = res.items.length > 0 ? res.items[0] : null;
        if (!invite) return null;

        // Check expiry
        if (new Date(invite['expiresAt']) < new Date()) {
          return null;
        }

        return {
          code: invite['code'],
          profileId: invite['profileId'],
          permission: invite['permission'] as PermissionLevel,
          expiresAt: invite['expiresAt']
        };
      }),
      catchError(() => of(null))
    );
  }

  consumeInvite(code: string): Observable<void> {
    return this.getInvite(code).pipe(
      switchMap(invite => {
        if (!invite) return throwError(() => new Error('Invitation invalide ou expirée'));

        const authData = this.getStoredAuth();
        if (!authData?.token) return throwError(() => new Error('Non authentifié'));
        const user = authData.record || authData.model; // Handle PB v0.36 vs old

        // Create access record
        return this.http.post<any>(`/api/collections/accesses/records`, {
          userId: user.id,
          profileId: invite.profileId,
          role: invite.permission
        }).pipe(
          switchMap(() => {
            // Mark invitation as used
            return this.http.get<{ items: any[] }>(`/api/collections/invitations/records`, {
                params: { filter: `code="${code}"` }
            }).pipe(
                switchMap(res => {
                    if (res.items.length > 0) {
                        return this.http.patch(`/api/collections/invitations/records/${res.items[0].id}`, { usedBy: user.id });
                    }
                    return of(undefined);
                })
            );
          }),
          map(() => undefined),
          catchError(err => {
              // If access already exists (unique constraint?), consider it success or handle specifically
              if (err.status === 400 || err.status === 403) {
                  return of(undefined);
              }
              return throwError(() => err);
          })
        );
      })
    );
  }

  private getStoredAuth(): any {
    const data = localStorage.getItem(this.AUTH_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
  }
}
