import { Injectable } from '@angular/core';
import { SharingAdapter, Invitation } from '../../../sharing.interface';
import { PermissionLevel } from '../../../../models/allergy-track.model';
import { of } from 'rxjs';

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

  async createInvite(profileId: string, permission: PermissionLevel): Promise<string> {
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

    return code;
  }

  async getInvite(code: string): Promise<Invitation | null> {
    const invite = this.getInvites().find(i => i.code === code);
    if (!invite) return null;

    if (new Date(invite.expiresAt) < new Date()) {
      return null;
    }

    return invite;
  }

  async consumeInvite(code: string): Promise<void> {
    const invite = await this.getInvite(code);
    if (!invite) throw new Error('Invitation invalide');

    // For Mock, we assume the user is stored in LocalStorage too
    const session = localStorage.getItem('at_mock_session');
    if (!session) throw new Error('Non authentifié');

    // We simulate adding access to the mock user
    console.log(`[LocalStorageSharingAdapter] Consumed invite ${code} for user ${session}`);
  }
}
