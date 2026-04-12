import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PermissionLevel } from '../models/allergy-track.model';
import { SHARING_ADAPTER } from './sharing.interface';

@Injectable({
  providedIn: 'root'
})
export class SharingService {
  private auth = inject(AuthService);
  private adapter = inject(SHARING_ADAPTER);

  /**
   * Generates a random code for sharing a dossier.
   */
  public async generateInviteCode(profileId: string, role: PermissionLevel): Promise<string> {
    return this.adapter.createInvite(profileId, role);
  }

  /**
   * Joins a dossier using an invite code.
   */
  public async joinDossier(code: string): Promise<void> {
    await this.adapter.consumeInvite(code);
    this.auth.checkSession();
  }
}
