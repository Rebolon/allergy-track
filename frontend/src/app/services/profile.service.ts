import { Injectable, inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Profile } from '../models/allergy-track.model';
import { AUTH_ADAPTER } from './auth.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private auth = inject(AuthService);
  private adapter = inject(AUTH_ADAPTER);

  /**
   * Creates a local profile (e.g. for a child without its own account).
   */
  public createLocalChild(name: string): Observable<Profile> {
    const user = this.auth.currentUser();
    if (!user) return throwError(() => new Error('Not authenticated'));

    const newProfile: Omit<Profile, 'id'> = {
      name,
      themePreference: 'colorful',
      isLocal: true
    };

    if (this.adapter.addProfile) {
      return this.adapter.addProfile(newProfile).pipe(
        switchMap(created => this.auth.checkSession().pipe(map(() => created)))
      );
    }
    return throwError(() => new Error('Adapter does not support adding profiles'));
  }

  /**
   * Directly adds a profile via the adapter.
   */
  addProfile(profile: Omit<Profile, 'id'>): Observable<Profile> {
    if (this.adapter.addProfile) {
      return this.adapter.addProfile(profile).pipe(
        switchMap(created => this.auth.checkSession().pipe(map(() => created)))
      );
    }
    return throwError(() => new Error('Add profile not supported by current adapter'));
  }

  deleteProfile(profileId: string): Observable<void> {
    if (this.adapter.deleteProfile) {
      return this.adapter.deleteProfile(profileId).pipe(
        switchMap(() => this.auth.checkSession().pipe(map(() => undefined)))
      );
    }
    return throwError(() => new Error('Delete profile not supported by current adapter'));
  }
}
