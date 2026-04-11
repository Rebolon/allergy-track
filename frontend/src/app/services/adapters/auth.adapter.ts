import { InjectionToken } from '@angular/core';
import { User } from '../../models/allergy-track.model';

export interface AuthAdapter {
  getUsers(): User[];
  updateUser(updatedUser: User): void;
  login?(): Promise<void>;
  logout?(): Promise<void>;
  isAuthenticated?(): boolean;
  getAuthUser?(): User | null;
}

export const AUTH_ADAPTER = new InjectionToken<AuthAdapter>('AUTH_ADAPTER');
