import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthAdapter } from '../../../auth.interface';
import { User, Profile, ProfileAccess } from '../../../../models/allergy-track.model';
import { MOCK_USERS, MOCK_PROFILES, MOCK_ACCESSES, MockUser, MockAccess } from './mock-users.data';

@Injectable({ providedIn: 'root' })
export class MockAuthAdapter implements AuthAdapter {
  private readonly SESSION_KEY = 'at_mock_session';
  private sessionUserId: string | null = localStorage.getItem(this.SESSION_KEY);

  private users: MockUser[] = [...MOCK_USERS];
  private profiles: Profile[] = [...MOCK_PROFILES];
  private accesses: MockAccess[] = [...MOCK_ACCESSES];

  getUsers(): User[] {
    // Note: On ne renvoie ici que les records de base pour le choix du user
    return this.users.map(u => this.reconstructUser(u));
  }

  updateUser(updatedUser: User): Observable<void> {
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        name: updatedUser.name 
      };
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
    const userRecord = this.users.find(u => u.id === this.sessionUserId);
    if (!userRecord) return of(null);
    return of(this.reconstructUser(userRecord));
  }

  addProfile(profile: Omit<Profile, 'id'>): Observable<Profile> {
    const userId = this.sessionUserId || this.users[0].id;
    const newProfile: Profile = {
      ...profile,
      id: 'p' + (Math.random().toString(36).substr(2, 9))
    };
    this.profiles.push(newProfile);
    this.accesses.push({ userId, profileId: newProfile.id, role: 'owner', colorCode: '#10b981' });
    
    return of(newProfile);
  }

  private reconstructUser(userRecord: MockUser): User {
    const userAccesses = this.accesses.filter(a => a.userId === userRecord.id);
    const profileAccesses: ProfileAccess[] = userAccesses.map(a => ({
      profileId: a.profileId,
      permission: a.role,
      colorCode: a.colorCode
    }));
    
    const profileIds = profileAccesses.map(a => a.profileId);
    const profiles = this.profiles.filter(p => profileIds.includes(p.id));

    return {
      ...userRecord,
      profileAccesses,
      profiles
    };
  }
}
