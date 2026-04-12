import { Injectable } from '@angular/core';
import { AuthAdapter } from '../../../auth.interface';
import { User, Role, Profile } from '../../../../models/allergy-track.model';
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
    // This would need to update the profiles in PocketBase
    // For now, let's keep it simple and update the primary profile
    const primary = updatedUser.profiles[0];
    if (this.pb.authStore.isValid && this.pb.authStore.model?.id === updatedUser.id && primary) {
      this.pb.collection('users').update(updatedUser.id, {
        name: updatedUser.name,
        role: primary.role,
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
    
    await this.pb.collection('users').update(user.id, {
      profiles: updatedProfiles
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
    
    // On construit un profil à partir des données de l'utilisateur
    // Dans une version future, on pourrait avoir une collection séparée pour les profils
    const mainProfile: Profile = {
      id: model.id,
      name: model['name'] || model['username'] || 'Moi',
      role: (model['role'] as Role) || 'Allergique',
      themePreference: (model['themePreference'] as 'flashy' | 'classic') || 'classic',
      avatar: model['avatar'],
      avatarSkinTone: model['avatarSkinTone']
    };

    return {
      id: model.id,
      email: model['email'],
      name: model['name'] || model['username'] || 'Utilisateur',
      profiles: [mainProfile]
    };
  }
}
