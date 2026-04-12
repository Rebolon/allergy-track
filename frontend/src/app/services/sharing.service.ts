import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PermissionLevel } from '../models/allergy-track.model';

@Injectable({
  providedIn: 'root'
})
export class SharingService {
  private auth = inject(AuthService);

  /**
   * Generates a random code for sharing a dossier.
   */
  public async generateInviteCode(profileId: string, role: PermissionLevel): Promise<string> {
    // In a real app, this calls an API
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log(`[SharingService] Generated ${role} code for profile ${profileId}: ${code}`);
    return code;
  }

  /**
   * Joins a dossier using an invite code.
   */
  public async joinDossier(code: string): Promise<void> {
    // In a real app, this calls an API to add Permission to current User
    console.log(`[SharingService] Joining dossier with code: ${code}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.auth.checkSession();
  }
}
