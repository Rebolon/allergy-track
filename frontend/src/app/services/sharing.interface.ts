import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionLevel } from '../models/allergy-track.model';

export interface Invitation {
  code: string;
  profileId: string;
  permission: PermissionLevel;
  expiresAt: string;
}

export interface SharingAdapter {
  createInvite(profileId: string, permission: PermissionLevel): Observable<string>;
  getInvite(code: string): Observable<Invitation | null>;
  consumeInvite(code: string): Observable<void>;
}

export const SHARING_ADAPTER = new InjectionToken<SharingAdapter>('SHARING_ADAPTER');
