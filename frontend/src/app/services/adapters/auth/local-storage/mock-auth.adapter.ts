import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthAdapter } from '../../../auth.interface';
import { User, Profile, ProfileAccess, PermissionLevel } from '../../../../models/allergy-track.model';

@Injectable({ providedIn: 'root' })
export class MockAuthAdapter implements AuthAdapter {
  private readonly SESSION_KEY = 'at_mock_session';
  private sessionUserId: string | null = localStorage.getItem(this.SESSION_KEY);

  private users: User[] = [
    {
      id: 'u_firstconnection',
      email: 'firstconnection@test.fr',
      name: 'Jean-Marc (First Connection)',
      profileAccesses: [
      ],
      profiles: [
      ]
    },
    {
      id: 'u_mixte',
      email: 'mixte@test.fr',
      name: 'Jean-Marc (Mixte)',
      profileAccesses: [
        { profileId: 'p1_1', permission: 'owner', colorCode: '#10b981' }
      ],
      profiles: [
        { id: 'p1_1', name: 'Mon Compte', themePreference: 'classic', birthDate: '1985-06-15' }
      ]
    },
    {
      id: 'u_parent',
      email: 'parent.allergique@test.fr',
      name: 'Famille Dupont',
      profileAccesses: [
        { profileId: 'p2_1', permission: 'owner', colorCode: '#3b82f6' },
        { profileId: 'p2_3', permission: 'owner', colorCode: '#f59e0b' }
      ],
      profiles: [
        { id: 'p2_1', name: 'Maman', themePreference: 'classic', birthDate: '1988-03-20' },
        { id: 'p2_3', name: 'Léo', themePreference: 'colorful', isLocal: true, birthDate: '2018-11-10' }
      ]
    },
    {
      id: 'u_medecin',
      email: 'medecin@test.fr',
      name: 'Dr. House',
      profileAccesses: [
        { profileId: 'p2_3', permission: 'reader', colorCode: '#8b5cf6' }
      ],
      profiles: [
        { id: 'p2_3', name: 'Léo', themePreference: 'colorful', isLocal: true, birthDate: '2018-11-10' }
      ]
    }
  ];

  getUsers(): User[] {
    return this.users;
  }

  updateUser(updatedUser: User): Observable<void> {
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = { ...updatedUser };
    }
    return of(undefined);
  }

  login(): Observable<void> {
    this.sessionUserId = this.users[0].id;
    localStorage.setItem(this.SESSION_KEY, this.sessionUserId);
    return of(undefined);
  }

  loginWithPassword(email: string, password: string): Observable<void> {
    const user = this.users.find(u => u.email === email);
    if (user && password === 'demo') {
      this.sessionUserId = user.id;
      localStorage.setItem(this.SESSION_KEY, user.id);
      return of(undefined);
    } else {
      return throwError(() => new Error('Identifiants invalides (utilisez "demo")'));
    }
  }

  logout(): Observable<void> {
    this.sessionUserId = null;
    localStorage.removeItem(this.SESSION_KEY);
    return of(undefined);
  }

  isAuthenticated(): boolean {
    return !!this.sessionUserId;
  }

  getAuthUser(): Observable<User | null> {
    return of(this.users.find(u => u.id === this.sessionUserId) || null);
  }

  addProfile(profile: Omit<Profile, 'id'>): Observable<Profile> {
    const sessionUser = this.users.find(u => u.id === this.sessionUserId) || this.users[0];
    const newProfile: Profile = {
      ...profile,
      id: 'p' + (Math.random().toString(36).substr(2, 9))
    };
    sessionUser.profiles.push(newProfile);
    sessionUser.profileAccesses.push({ profileId: newProfile.id, permission: 'owner', colorCode: '#10b981' });
    this.updateUser(sessionUser);
    return of(newProfile);
  }
}
