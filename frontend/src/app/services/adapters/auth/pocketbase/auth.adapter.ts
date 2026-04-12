import { Injectable } from '@angular/core';
import { AuthAdapter } from '../../../auth.interface';
import { User, Profile, ProfileAccess, PermissionLevel } from '../../../../models/allergy-track.model';
import PocketBase from 'pocketbase';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseAuthAdapter implements AuthAdapter {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(environment.pocketbaseUrl);
  }

  getUsers(): User[] {
    return [];
  }

  async updateUser(updatedUser: User): Promise<void> {
    if (this.pb.authStore.isValid && this.pb.authStore.model?.id === updatedUser.id) {
        // Sync user name
        await this.pb.collection('users').update(updatedUser.id, {
            name: updatedUser.name
        });
        
        // Sync profiles in their own collection
        for (const profile of updatedUser.profiles) {
            await this.pb.collection('profiles').update(profile.id, {
                name: profile.name,
                birthDate: profile.birthDate,
                themePreference: profile.themePreference
            });
        }
    }
  }

  async login(): Promise<void> {
    await this.pb.collection('users').authWithOAuth2({ provider: 'synology' });
  }

  async loginWithPassword(email: string, password: string): Promise<void> {
    await this.pb.collection('users').authWithPassword(email, password);
  }

  async logout(): Promise<void> {
    this.pb.authStore.clear();
  }

  async addProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
    const user = this.pb.authStore.model;
    if (!user) throw new Error('Not authenticated');

    // 1. Create Profile in 'profiles' collection
    const profileRecord = await this.pb.collection('profiles').create({
      ...profile,
      ownerId: user.id
    });

    const newProfile: Profile = {
      id: profileRecord.id,
      name: profileRecord['name'],
      birthDate: profileRecord['birthDate'],
      themePreference: profileRecord['themePreference']
    };

    // 2. Add Access to current User
    await this.pb.collection('users').update(user.id, {
      'profile_accesses+': [{
        profileId: newProfile.id,
        permission: 'owner'
      }]
    });

    return newProfile;
  }

  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  async getAuthUser(): Promise<User | null> {
    if (!this.pb.authStore.isValid || !this.pb.authStore.model) {
      return null;
    }

    const model = this.pb.authStore.model;
    const profileAccesses: ProfileAccess[] = model['profile_accesses'] || [];
    
    // Load actual profiles from 'profiles' collection
    const profiles: Profile[] = [];
    if (profileAccesses.length > 0) {
        const profileIds = profileAccesses.map(a => a.profileId);
        const filter = profileIds.map(id => `id="${id}"`).join(' || ');
        try {
            const records = await this.pb.collection('profiles').getFullList({ filter });
            records.forEach(r => {
                profiles.push({
                    id: r.id,
                    name: r['name'],
                    birthDate: r['birthDate'],
                    themePreference: r['themePreference']
                });
            });
        } catch (e) {
            console.error('[PocketbaseAuthAdapter] Failed to load profiles', e);
        }
    }

    return {
      id: model.id,
      email: model['email'],
      name: model['name'] || model['username'] || 'Utilisateur',
      profileAccesses,
      profiles
    };
  }
}
