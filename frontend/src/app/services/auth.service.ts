import { Injectable, signal } from '@angular/core';
import { User, Role } from '../models/allergi-track.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly MOCK_USERS: User[] = [
    { id: 'u1', name: 'Supervision', role: 'Adulte', themePreference: 'classic' },
    { id: 'u2', name: 'Suivi', role: 'Enfant', themePreference: 'flashy' }
  ];

  currentUser = signal<User>(this.MOCK_USERS[1]); // Default to Enfant

  updateSuiviTheme(newTheme: 'flashy' | 'classic') {
    const suiviUser = this.MOCK_USERS.find(u => u.id === 'u2');
    if (suiviUser) {
      suiviUser.themePreference = newTheme;
      if (this.currentUser().id === 'u2') {
        this.currentUser.set({ ...suiviUser });
      }
    }
  }

  switchUser(role: Role) {
    const user = this.MOCK_USERS.find(u => u.role === role);
    if (user) {
      this.currentUser.set(user);
    }
  }

  switchSpecificUser(id: string) {
    const user = this.MOCK_USERS.find(u => u.id === id);
    if (user) {
      this.currentUser.set(user);
    }
  }

  getUsers(): User[] {
    return this.MOCK_USERS;
  }
}
