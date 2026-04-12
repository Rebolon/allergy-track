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

  /**
   * Creates a local profile (e.g. for a child without its own account).
   */
  public async createLocalChild(name: string): Promise<Profile> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const newProfile: Omit<Profile, 'id'> = {
      name,
      themePreference: 'colorful',
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

  /**
   * Directly adds a profile via the adapter.
   */
  async addProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
    if (this.adapter.addProfile) {
      const created = await this.adapter.addProfile(profile);
      this.auth.checkSession();
      return created;
    }
    throw new Error('Add profile not supported by current adapter');
  }
}
