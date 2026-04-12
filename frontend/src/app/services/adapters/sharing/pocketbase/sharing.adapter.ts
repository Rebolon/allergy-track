import { Injectable } from '@angular/core';
import { SharingAdapter, Invitation } from '../../../sharing.interface';
import { PermissionLevel } from '../../../../models/allergy-track.model';
import PocketBase from 'pocketbase';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseSharingAdapter implements SharingAdapter {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(environment.pocketbaseUrl);
  }

  async createInvite(profileId: string, permission: PermissionLevel): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24h validity

    await this.pb.collection('invitations').create({
      code,
      profileId,
      permission,
      expiresAt: expiresAt.toISOString()
    });

    return code;
  }

  async getInvite(code: string): Promise<Invitation | null> {
    try {
      const invite = await this.pb.collection('invitations').getFirstListItem(`code="${code}"`);
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
    } catch (e) {
      return null;
    }
  }

  async consumeInvite(code: string): Promise<void> {
    const invite = await this.getInvite(code);
    if (!invite) throw new Error('Invitation invalide ou expirée');

    const user = this.pb.authStore.model;
    if (!user) throw new Error('Non authentifié');

    // Update user accesses
    const currentAccesses = Array.isArray(user['profile_accesses']) ? user['profile_accesses'] : [];
    const alreadyHasAccess = currentAccesses.some((a: any) => a.profileId === invite.profileId);
    
    if (!alreadyHasAccess) {
      const updatedAccesses = [
        ...currentAccesses,
        {
          profileId: invite.profileId,
          permission: invite.permission
        }
      ];

      await this.pb.collection('users').update(user.id, {
        'profile_accesses': updatedAccesses
      });
      
      // Update local model so next time we fetch it has the new data
      this.pb.authStore.model!['profile_accesses'] = updatedAccesses;
    }

    // Mark as used (optional)
    try {
        const record = await this.pb.collection('invitations').getFirstListItem(`code="${code}"`);
        await this.pb.collection('invitations').update(record.id, { usedBy: user.id });
    } catch(e) {
        // Silently fail
    }
  }
}
