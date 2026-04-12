import { Injectable } from '@angular/core';
import { AuthAdapter } from '../../../auth.interface';
import { User, Role, Profile } from '../../../../models/allergy-track.model';

@Injectable({ providedIn: 'root' })
export class MockAuthAdapter implements AuthAdapter {
  private readonly SESSION_KEY = 'at_mock_session';
  private sessionUserId: string | null = localStorage.getItem(this.SESSION_KEY);

  private users: User[] = [
    {
      id: 'u_super_all_no_child',
      email: 'superviseur.allergique.nochild@test.fr',
      name: 'Jean-Marc (Superviseur Allergique)',
      profiles: [
        { id: 'p1_1', name: 'Mon Compte (Superviseur)', role: 'Supervision', themePreference: 'classic', avatar: '🏠' },
        { id: 'p1_2', name: 'Moi (Allergique)', role: 'Allergique', themePreference: 'classic', avatar: '🧘' }
      ]
    },
    {
      id: 'u_super_all_with_child',
      email: 'parent.allergique@test.fr',
      name: 'Famille Dupont',
      profiles: [
        { id: 'p2_1', name: 'Maman (Superviseur)', role: 'Supervision', themePreference: 'classic', avatar: '🏠' },
        { id: 'p2_2', name: 'Maman (Allergique)', role: 'Allergique', themePreference: 'classic', avatar: '👩' },
        { id: 'p2_3', name: 'Léo', role: 'Allergique', themePreference: 'flashy', isLocal: true, avatar: '👶' }
      ]
    },
    {
      id: 'u_super_only_no_child',
      email: 'superviseur.only.nochild@test.fr',
      name: 'Superviseur Solo',
      profiles: [
        { id: 'p3_1', name: 'Mon Compte', role: 'Supervision', themePreference: 'classic', avatar: '🏠' }
      ]
    },
    {
      id: 'u_super_only_with_child',
      email: 'parent.only@test.fr',
      name: 'Famille Martin',
      profiles: [
        { id: 'p4_1', name: 'Papa (Superviseur)', role: 'Supervision', themePreference: 'classic', avatar: '🏠' },
        { id: 'p4_2', name: 'Sarah', role: 'Allergique', themePreference: 'flashy', isLocal: true, avatar: '👶' }
      ]
    },
    {
      id: 'u_all_only_no_super',
      email: 'allergique.solo@test.fr',
      name: 'Kevin Solo',
      profiles: [
        { id: 'p5_1', name: 'Mon Suivi', role: 'Allergique', themePreference: 'classic', avatar: '🏃' }
      ]
    },
    {
      id: 'u_all_only_with_super',
      email: 'allergique.supervise@test.fr',
      name: 'Emma (Supervisée)',
      profiles: [
        { id: 'p6_1', name: 'Emma', role: 'Allergique', themePreference: 'classic', avatar: '👩' }
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

  async login(): Promise<void> {
    // SSO Mock - On logue le premier utilisateur par défaut
    this.sessionUserId = this.users[0].id;
    localStorage.setItem(this.SESSION_KEY, this.sessionUserId);
  }

  async loginWithPassword(email: string, password: string): Promise<void> {
    const user = this.users.find(u => u.email === email);
    if (user && password === 'demo') {
      this.sessionUserId = user.id;
      localStorage.setItem(this.SESSION_KEY, user.id);
    } else {
      throw new Error('Identifiants invalides (utilisez "demo")');
    }
  }

  async logout(): Promise<void> {
    this.sessionUserId = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.sessionUserId;
  }

  getAuthUser(): User | null {
    return this.users.find(u => u.id === this.sessionUserId) || null;
  }

  async addProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
    const user = this.getAuthUser() || this.users[0]; 
    const newProfile: Profile = { 
      ...profile, 
      id: 'p' + (Math.random().toString(36).substr(2, 9)),
      avatar: profile.avatar || '👶'
    };
    user.profiles.push(newProfile);
    this.updateUser(user);
    return newProfile;
  }
}

