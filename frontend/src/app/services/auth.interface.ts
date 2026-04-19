import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { User, Profile } from '../models/allergy-track.model';

export interface AuthAdapter {
  getUsers(): User[]; // This one returns an array directly in the mock, might want to keep it or make it Observable if it involves a fetch.
  updateUser(updatedUser: User): Observable<void>;
  login?(): Observable<void>;
  loginWithPassword?(email: string, password: string): Observable<void>;
  logout?(): Observable<void>;
  isAuthenticated?(): boolean;
  getAuthUser?(): Observable<User | null>;
  addProfile?(profile: Omit<Profile, 'id'>): Observable<Profile>;
  updateProfile?(profile: Profile): Observable<void>;
  deleteProfile?(profileId: string): Observable<void>;
}

export const AUTH_ADAPTER = new InjectionToken<AuthAdapter>('AUTH_ADAPTER');
