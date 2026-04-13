import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { tap, map, catchError, switchMap, take } from 'rxjs/operators';
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
  isReady = signal<boolean>(false);        // Signal volatile pour les opérations en cours
  isInitialized = signal<boolean>(false);  // Signal persistant après le premier boot

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

  needsOnboarding = computed(() => {
    const user = this.currentUser();
    const active = this.activeProfile();
    
    if (this.isAuthenticated() && this.isInitialized()) {
      // Cas 1: Aucun profil créé
      if (!user || !user.profileAccesses || user.profileAccesses.length === 0) {
        return true;
      }

      // Cas 2: Profil actif incomplet
      if (active) {
        return active.onboardingStep !== 'completed';
      }
    }

    return false;
  });

  constructor() {
    this.checkSession().subscribe();
  }

  checkSession(): Observable<User | null> {
    this.isReady.set(false);
    if (this.adapter.getAuthUser && this.adapter.isAuthenticated) {
      const isAuth = this.adapter.isAuthenticated();
      this.isAuthenticated.set(isAuth);
      
      return this.adapter.getAuthUser().pipe(
        tap(user => {
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
          this.isReady.set(true);
          this.isInitialized.set(true);
        }),
        catchError(err => {
            console.error('[AuthService] Session check failed', err);
            this.isReady.set(true);
            this.isInitialized.set(true);
            return of(null);
        })
      );
    }
    this.isReady.set(true);
    this.isInitialized.set(true);
    return of(null);
  }

  login(): Observable<void> {
    this.isReady.set(false);
    if (this.adapter.login) {
      return this.adapter.login().pipe(
        switchMap(() => this.checkSession()),
        map(() => undefined)
      );
    }
    return of(undefined);
  }

  loginWithPassword(email: string, pass: string): Observable<void> {
    this.isReady.set(false);
    if (this.adapter.loginWithPassword) {
      return this.adapter.loginWithPassword(email, pass).pipe(
        switchMap(() => this.checkSession()),
        map(() => undefined)
      );
    }
    return of(undefined);
  }

  logout(): Observable<void> {
    if (this.adapter.logout) {
      return this.adapter.logout().pipe(
        tap(() => {
            this.currentUser.set(null);
            this.activeProfile.set(null);
            this.isAuthenticated.set(false);
        })
      );
    }
    this.currentUser.set(null);
    this.activeProfile.set(null);
    this.isAuthenticated.set(false);
    return of(undefined);
  }

  updateProfile(profile: Profile): Observable<void> {
    const user = this.currentUser();
    if (user && user.profiles) {
      const pIdx = user.profiles.findIndex(p => p.id === profile.id);
      if (pIdx !== -1) {
        user.profiles[pIdx] = { ...profile };
        
        return this.adapter.updateUser(user).pipe(
            tap(() => {
                this.currentUser.set({ ...user });
                if (this.activeProfile()?.id === profile.id) {
                    this.activeProfile.set({ ...profile });
                }
            })
        );
      }
    }
    return of(undefined);
  }

  updateProfileTheme(newTheme: 'colorful' | 'classic'): Observable<void> {
    const profile = this.activeProfile();
    if (profile) {
      const updatedProfile = { ...profile, themePreference: newTheme };
      return this.updateProfile(updatedProfile);
    }
    return of(undefined);
  }

  switchProfile(profileId: string): void {
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
