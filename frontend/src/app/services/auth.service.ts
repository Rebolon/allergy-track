import { Injectable, inject, signal, computed } from '@angular/core';
import { User, Profile, PermissionLevel } from '../models/allergy-track.model';
import { AUTH_ADAPTER } from './auth.interface';

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

  // Derivate signals for UI context
  activePermission = computed<PermissionLevel | null>(() => {
    const profile = this.activeProfile();
    const user = this.currentUser();
    if (!profile || !user || !user.profileAccesses) return null;
    return user.profileAccesses.find(a => a.profileId === profile.id)?.permission || null;
  });

  activeColor = computed<string>(() => {
    const profile = this.activeProfile();
    const user = this.currentUser();
    if (!profile || !user || !user.profileAccesses) return '#6366f1'; // Default violet
    return user.profileAccesses.find(a => a.profileId === profile.id)?.colorCode || '#6366f1';
  });

  constructor() {
    this.checkSession();
  }

  checkSession() {
    if (this.adapter.getAuthUser && this.adapter.isAuthenticated) {
      const isAuth = this.adapter.isAuthenticated();
      this.isAuthenticated.set(isAuth);
      const user = this.adapter.getAuthUser();
      this.currentUser.set(user);
      if (user && user.profiles && user.profiles.length > 0) {
        // Recovery of first profile if none active
        if (!this.activeProfile()) {
          this.activeProfile.set(user.profiles[0]);
        } else {
          // Sync active profile with updated user data if needed
          const updatedActive = user.profiles.find(p => p.id === this.activeProfile()?.id);
          if (updatedActive) this.activeProfile.set(updatedActive);
        }
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

  updateProfile(profile: Profile) {
    const user = this.currentUser();
    if (user && user.profiles) {
      const pIdx = user.profiles.findIndex(p => p.id === profile.id);
      if (pIdx !== -1) {
        user.profiles[pIdx] = { ...profile };
        this.adapter.updateUser(user);
        this.currentUser.set({ ...user });
        
        if (this.activeProfile()?.id === profile.id) {
          this.activeProfile.set({ ...profile });
        }
      }
    }
  }

  updateProfileTheme(newTheme: 'colorful' | 'classic') {
    const profile = this.activeProfile();
    if (profile) {
      profile.themePreference = newTheme;
      this.updateProfile(profile);
    }
  }

  switchProfile(profileId: string) {
    const user = this.currentUser();
    if (user && user.profiles) {
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
