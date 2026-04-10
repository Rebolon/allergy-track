import { Injectable } from '@angular/core';
import { AuthAdapter } from './auth.adapter';
import { User } from '../../models/allergy-track.model';

@Injectable({ providedIn: 'root' })
export class MockAuthAdapter implements AuthAdapter {
  private users: User[] = [
    { id: 'u1', name: 'Supervision', role: 'Adulte', themePreference: 'classic' },
    { id: 'u2', name: 'Suivi', role: 'Enfant', themePreference: 'flashy' }
  ];

  getUsers(): User[] {
    return this.users;
  }

  updateUser(updatedUser: User): void {
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = { ...updatedUser };
    }
  }
}
