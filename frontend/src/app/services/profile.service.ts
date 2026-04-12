import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Profile } from '../models/allergy-track.model';
import { AUTH_ADAPTER } from './auth.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private auth = inject(AuthService);
  private adapter = inject(AUTH_ADAPTER);

  public async createLocalChild(name: string) {
    const user = this.auth.currentUser();
    if (!user) return;

    const newProfile: Omit<Profile, 'id'> = {
      name,
      themePreference: 'flashy',
      isLocal: true
    };

    if (this.adapter.addProfile) {
      const created = await this.adapter.addProfile(newProfile);
      // Refresh session to get updated profileAccesses and profiles
      this.auth.checkSession();
      return created;
    }
    throw new Error('Adapter does not support adding profiles');
  }

  public async generateInvitationToken(profileId: string): Promise<string> {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log(`Invitation token for ${profileId}: ${token}`);
    return token;
  }

  public async acceptInvitation(token: string) {
    console.log(`Accepting invitation with token: ${token}`);
    // Refresh to check if any new access granted
    this.auth.checkSession();
  }

  async addProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
    if (this.adapter.addProfile) {
      const created = await this.adapter.addProfile(profile);
      this.auth.checkSession();
      return created;
    }
    throw new Error('Add profile not supported by current adapter');
  }
}
