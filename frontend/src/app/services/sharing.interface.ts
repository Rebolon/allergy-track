import { InjectionToken } from '@angular/core';
import { PermissionLevel } from '../models/allergy-track.model';

export interface Invitation {
  code: string;
  profileId: string;
  permission: PermissionLevel;
  expiresAt: string;
}

export interface SharingAdapter {
  createInvite(profileId: string, permission: PermissionLevel): Promise<string>;
  getInvite(code: string): Promise<Invitation | null>;
  consumeInvite(code: string): Promise<void>;
}

export const SHARING_ADAPTER = new InjectionToken<SharingAdapter>('SHARING_ADAPTER');
