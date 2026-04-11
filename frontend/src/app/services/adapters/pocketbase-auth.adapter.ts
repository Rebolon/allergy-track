import { Injectable } from '@angular/core';
import { AuthAdapter } from './auth.adapter';
import { User, Role } from '../../models/allergy-track.model';
import PocketBase from 'pocketbase';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseAuthAdapter implements AuthAdapter {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(environment.pocketbaseUrl);
  }

  getUsers(): User[] {
    // En mode réel, on ne récupère pas une liste fixe d'utilisateurs
    // mais on pourrait retourner l'utilisateur actuel dans une liste
    const user = this.getAuthUser();
    return user ? [user] : [];
  }

  updateUser(updatedUser: User): void {
    if (this.pb.authStore.isValid && this.pb.authStore.model?.id === updatedUser.id) {
      this.pb.collection('users').update(updatedUser.id, {
        name: updatedUser.name,
        role: updatedUser.role,
        themePreference: updatedUser.themePreference
      });
    }
  }

  async login(): Promise<void> {
    // Déclenche le flux OAuth2 avec Synology
    await this.pb.collection('users').authWithOAuth2({ provider: 'synology' });
  }

  async logout(): Promise<void> {
    this.pb.authStore.clear();
  }

  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  getAuthUser(): User | null {
    if (!this.pb.authStore.isValid || !this.pb.authStore.model) {
      return null;
    }

    const model = this.pb.authStore.model;
    return {
      id: model.id,
      name: model.name || model.username || 'Utilisateur',
      role: (model.role as Role) || 'Adulte',
      themePreference: (model.themePreference as 'flashy' | 'classic') || 'classic'
    };
  }
}
