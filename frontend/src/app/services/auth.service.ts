import { Injectable, inject, signal } from '@angular/core';
import { User, Role } from '../models/allergy-track.model';
import { AUTH_ADAPTER } from './adapters/auth.adapter';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adapter = inject(AUTH_ADAPTER);

  // Default to Enfant (assuming 'u2' is the Enfant)
  currentUser = signal<User>(this.adapter.getUsers().find(u => u.id === 'u2')!);

  updateSuiviTheme(newTheme: 'flashy' | 'classic') {
    const suiviUser = this.adapter.getUsers().find(u => u.id === 'u2');
    if (suiviUser) {
      suiviUser.themePreference = newTheme;
      this.adapter.updateUser(suiviUser);

      if (this.currentUser().id === 'u2') {
        this.currentUser.set({ ...suiviUser });
      }
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
