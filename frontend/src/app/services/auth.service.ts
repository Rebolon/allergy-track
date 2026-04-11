import { Injectable, inject, signal } from '@angular/core';
import { User, Role, Profile } from '../models/allergy-track.model';
import { AUTH_ADAPTER } from './adapters/auth.adapter';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adapter = inject(AUTH_ADAPTER);

  // Signaux d'état
  currentUser = signal<User | null>(null);
  activeProfile = signal<Profile | null>(null);
  isAuthenticated = signal<boolean>(false);
  isReady = signal<boolean>(false);

  constructor() {
    this.checkSession();
  }

  checkSession() {
    if (this.adapter.getAuthUser && this.adapter.isAuthenticated) {
      const isAuth = this.adapter.isAuthenticated();
      this.isAuthenticated.set(isAuth);
      const user = this.adapter.getAuthUser();
      this.currentUser.set(user);
      if (user && user.profiles.length > 0) {
        this.activeProfile.set(user.profiles[0]);
      }
    } else {
      const defaultUser = this.adapter.getUsers().find(u => u.id === 'u2') || null;
      this.currentUser.set(defaultUser);
      this.isAuthenticated.set(!!defaultUser);
      if (defaultUser && defaultUser.profiles.length > 0) {
        this.activeProfile.set(defaultUser.profiles[0]);
      }
    }
    this.isReady.set(true);
  }

  async login() {
    if (this.adapter.login) {
      await this.adapter.login();
      this.checkSession();
    }
  }

  async loginWithPassword(email: string, pass: string) {
    if (this.adapter.loginWithPassword) {
      await this.adapter.loginWithPassword(email, pass);
      this.checkSession();
    }
  }

  async logout() {
    if (this.adapter.logout) {
      await this.adapter.logout();
    }
    this.currentUser.set(null);
    this.activeProfile.set(null);
    this.isAuthenticated.set(false);
  }

  updateProfileTheme(newTheme: 'flashy' | 'classic') {
    const profile = this.activeProfile();
    const user = this.currentUser();
    if (profile && user) {
      profile.themePreference = newTheme;
      const pIdx = user.profiles.findIndex(p => p.id === profile.id);
      if (pIdx !== -1) user.profiles[pIdx] = { ...profile };
      
      this.adapter.updateUser(user);
      this.activeProfile.set({ ...profile });
      this.currentUser.set({ ...user });
    }
  }

  switchProfile(profileId: string) {
    const user = this.currentUser();
    if (user) {
      const profile = user.profiles.find(p => p.id === profileId);
      if (profile) {
        this.activeProfile.set(profile);
      }
    }
  }

  getUsers(): User[] {
    return this.adapter.getUsers();
  }
}
