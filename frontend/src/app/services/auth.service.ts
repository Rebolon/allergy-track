import { Injectable, inject, signal } from '@angular/core';
import { User, Role } from '../models/allergy-track.model';
import { AUTH_ADAPTER } from './adapters/auth.adapter';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adapter = inject(AUTH_ADAPTER);

  // Signaux d'état
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isReady = signal<boolean>(false); // Indique si la session initiale a été vérifiée

  constructor() {
    // Initialisation
    this.checkSession();
  }

  checkSession() {
    if (this.adapter.getAuthUser && this.adapter.isAuthenticated) {
      const isAuth = this.adapter.isAuthenticated();
      this.isAuthenticated.set(isAuth);
      this.currentUser.set(this.adapter.getAuthUser());
    } else {
      // Fallback pour le mock adapter s'il n'implémente pas encore tout
      const defaultUser = this.adapter.getUsers().find(u => u.id === 'u2') || null;
      this.currentUser.set(defaultUser);
      this.isAuthenticated.set(!!defaultUser);
    }
    
    // On marque l'auth comme prête après un léger délai pour le splashscreen (ou immédiatement en dev)
    // Mais ici on se contente de mettre à true, le splash screen gérera son propre délai.
    this.isReady.set(true);
  }

  async login() {
    if (this.adapter.login) {
      await this.adapter.login();
      this.checkSession();
    }
  }

  async logout() {
    if (this.adapter.logout) {
      await this.adapter.logout();
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  updateSuiviTheme(newTheme: 'flashy' | 'classic') {
    const user = this.currentUser();
    if (user) {
      user.themePreference = newTheme;
      this.adapter.updateUser(user);
      this.currentUser.set({ ...user });
    }
  }

  switchUser(role: Role) {
    const user = this.adapter.getUsers().find(u => u.role === role);
    if (user) {
      this.currentUser.set(user);
    }
  }

  switchSpecificUser(id: string) {
    const user = this.adapter.getUsers().find(u => u.id === id);
    if (user) {
      this.currentUser.set(user);
    }
  }

  getUsers(): User[] {
    return this.adapter.getUsers();
  }
}
