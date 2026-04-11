import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Profile } from '../models/allergy-track.model';
import { AUTH_ADAPTER } from './adapters/auth.adapter';

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
      role: 'Allergique',
      themePreference: 'flashy',
      isLocal: true
    };

    if (this.adapter.addProfile) {
      const created = await this.adapter.addProfile(newProfile);
      // Refresh current user signal in AuthService
      const updatedUser = { ...user, profiles: [...user.profiles, created] };
      this.auth.currentUser.set(updatedUser);
      return created;
    }
    throw new Error('Adapter does not support adding profiles');
  }

  public async generateInvitationToken(profileId: string): Promise<string> {
    // This would ideally interact with a backend collection 'invitations'
    // For now, let's pretend and return a mock token
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log(`Invitation token for ${profileId}: ${token}`);
    return token;
  }

  public async acceptInvitation(token: string) {
    // Simulation: check token, find profile, add to user's profiles
    console.log(`Accepting invitation with token: ${token}`);
    // In a real app, this would add an external profile to our list
  }
}
