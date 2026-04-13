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
        if (!authData?.model) return throwError(() => new Error('Non authentifié'));
        const user = authData.model;

        // Update user accesses
        const currentAccesses = Array.isArray(user['profile_accesses']) ? user['profile_accesses'] : [];
        const alreadyHasAccess = currentAccesses.some((a: any) => a.profileId === invite.profileId);
        
        if (alreadyHasAccess) return of(undefined);

        const updatedAccesses = [
          ...currentAccesses,
          {
            profileId: invite.profileId,
            permission: invite.permission
          }
        ];

        return this.http.patch<any>(`/api/collections/users/records/${user.id}`, {
          'profile_accesses': updatedAccesses
        }).pipe(
          tap(updatedUser => {
            // Update local storage so other components see the change
            authData.model = updatedUser;
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
          }),
          map(() => undefined)
        );
      }),
      switchMap(() => {
        // Mark as used
        const authData = this.getStoredAuth();
        const user = authData?.model;
        if (!user) return of(undefined);

        return this.http.get<{ items: any[] }>(`/api/collections/invitations/records`, {
            params: { filter: `code="${code}"` }
        }).pipe(
            switchMap(res => {
                if (res.items.length > 0) {
                    return this.http.patch(`/api/collections/invitations/records/${res.items[0].id}`, { usedBy: user.id });
                }
                return of(undefined);
            }),
            catchError(() => of(undefined)), // Silently fail marking as used
            map(() => undefined)
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
