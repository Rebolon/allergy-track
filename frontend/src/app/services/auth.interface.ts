import { InjectionToken } from '@angular/core';
import { User, Profile } from '../models/allergy-track.model';

export interface AuthAdapter {
  getUsers(): User[];
  updateUser(updatedUser: User): Promise<void>;
  login?(): Promise<void>;
  loginWithPassword?(email: string, password: string): Promise<void>;
  logout?(): Promise<void>;
  isAuthenticated?(): boolean;
  getAuthUser?(): Promise<User | null>;
  addProfile?(profile: Omit<Profile, 'id'>): Promise<Profile>;
}

export const AUTH_ADAPTER = new InjectionToken<AuthAdapter>('AUTH_ADAPTER');
