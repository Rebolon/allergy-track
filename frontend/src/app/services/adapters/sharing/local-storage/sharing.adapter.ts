import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { SharingAdapter, Invitation } from '../../../sharing.interface';
import { PermissionLevel } from '../../../../models/allergy-track.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageSharingAdapter implements SharingAdapter {
  private readonly INVITES_KEY = 'at_mock_invites';

  private getInvites(): Invitation[] {
    const data = localStorage.getItem(this.INVITES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveInvites(invites: Invitation[]) {
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));
  }

  createInvite(profileId: string, permission: PermissionLevel): Observable<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    const invites = this.getInvites();
    invites.push({
      code,
      profileId,
      permission,
      expiresAt: expiresAt.toISOString()
    });
    this.saveInvites(invites);

    return of(code);
  }

  getInvite(code: string): Observable<Invitation | null> {
    const invite = this.getInvites().find(i => i.code === code);
    if (!invite) return of(null);

    if (new Date(invite.expiresAt) < new Date()) {
      return of(null);
    }

    return of(invite);
  }

  consumeInvite(code: string): Observable<void> {
    const invites = this.getInvites();
    const inviteIdx = invites.findIndex(i => i.code === code);
    
    if (inviteIdx === -1) return throwError(() => new Error('Invitation invalide'));
    const invite = invites[inviteIdx];

    if (new Date(invite.expiresAt) < new Date()) {
      return throwError(() => new Error('Invitation expirée'));
    }

    // For Mock, we assume the user is stored in LocalStorage too
    const session = localStorage.getItem('at_mock_session');
    if (!session) return throwError(() => new Error('Non authentifié'));

    // We simulate adding access to the mock user
    console.log(`[LocalStorageSharingAdapter] Consumed invite ${code} for user ${session}`);
    return of(undefined);
  }
}
