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
    const user = this.getAuthUser();
    return user ? [user] : [];
  }

  updateUser(updatedUser: User): void {
    const primary = updatedUser.profiles[0];
    if (this.pb.authStore.isValid && this.pb.authStore.model?.id === updatedUser.id && primary) {
      this.pb.collection('users').update(updatedUser.id, {
        name: updatedUser.name,
        themePreference: primary.themePreference,
        avatar: primary.avatar,
        avatarSkinTone: primary.avatarSkinTone
      });
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
    const user = this.getAuthUser();
    if (!user) throw new Error('Not authenticated');

    const newProfile: Profile = { ...profile, id: crypto.randomUUID() };
    const updatedProfiles = [...user.profiles, newProfile];
    
    // In PB, we update the user model
    await this.pb.collection('users').update(user.id, {
      profiles: updatedProfiles,
      // For now, auto-add as owner in accesses
      profile_accesses: [...user.profileAccesses, { profileId: newProfile.id, permission: 'owner' }]
    });

    return newProfile;
  }

  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  getAuthUser(): User | null {
    if (!this.pb.authStore.isValid || !this.pb.authStore.model) {
      return null;
    }

    const model = this.pb.authStore.model;
    
    // Legacy support: extract profile from user model if no explicit profiles list
    const mainProfile: Profile = {
      id: model.id,
      name: model['name'] || model['username'] || 'Moi',
      themePreference: (model['themePreference'] as 'colorful' | 'classic') || 'classic',
      avatar: model['avatar'],
      avatarSkinTone: model['avatarSkinTone'],
      birthDate: model['birthDate']
    };

    const profileAccesses: ProfileAccess[] = model['profile_accesses'] || [{ profileId: model.id, permission: 'owner' }];
    const profiles: Profile[] = model['profiles'] || [mainProfile];

    return {
      id: model.id,
      email: model['email'],
      name: model['name'] || model['username'] || 'Utilisateur',
      profileAccesses,
      profiles
    };
  }
}
