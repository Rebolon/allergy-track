import { Injectable } from '@angular/core';
import { AuthAdapter } from './auth.adapter';
import { User, Role, Profile } from '../../models/allergy-track.model';

@Injectable({ providedIn: 'root' })
export class MockAuthAdapter implements AuthAdapter {
  private users: User[] = [
    {
      id: 'u1',
      email: 'parent@example.com',
      name: 'Supervision',
      profiles: [
        { id: 'p1', name: 'Mon Compte', role: 'Supervision', themePreference: 'classic' },
        { id: 'p2', name: 'Léo', role: 'Allergique', themePreference: 'classic', isLocal: true },
        { id: 'p3', name: 'Sarah', role: 'Allergique', themePreference: 'flashy', isLocal: true }
      ]
    },
    {
      id: 'u2',
      email: 'patient@example.com',
      name: 'Allergique',
      profiles: [
        { id: 'p4', name: 'Mon Suivi', role: 'Allergique', themePreference: 'flashy' }
      ]
    }
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

  async addProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
    const user = this.users[0]; 
    const newProfile: Profile = { ...profile, id: 'p' + (user.profiles.length + 1) };
    user.profiles.push(newProfile);
    return newProfile;
  }
}
