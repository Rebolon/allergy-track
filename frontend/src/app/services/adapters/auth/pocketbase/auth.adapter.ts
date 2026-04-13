import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthAdapter } from '../../../auth.interface';
import { User, Profile, ProfileAccess } from '../../../../models/allergy-track.model';
import PocketBase from 'pocketbase';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseAuthAdapter implements AuthAdapter {
  private http = inject(HttpClient);
  private pb: PocketBase;
  private readonly baseUrl = environment.pocketbaseUrl;
  private readonly AUTH_KEY = 'pocketbase_auth';

  constructor() {
    this.pb = new PocketBase(this.baseUrl);
  }

  getUsers(): User[] {
    return [];
  }

  updateUser(updatedUser: User): Observable<void> {
    const userId = updatedUser.id;
    
    // 1. Sync user name
    const userUpdate$ = this.http.patch(`/api/collections/users/records/${userId}`, {
        name: updatedUser.name
    });

    // 2. Sync profiles in their own collection
    const profileUpdates$ = updatedUser.profiles.map(profile => 
        this.http.patch(`/api/collections/profiles/records/${profile.id}`, {
            name: profile.name,
            birthDate: profile.birthDate,
            themePreference: profile.themePreference,
            onboardingStep: profile.onboardingStep
        })
    );

    return forkJoin([userUpdate$, ...profileUpdates$]).pipe(
        map(() => undefined),
        catchError(err => {
            console.error('[PocketbaseAuthAdapter] Update failed', err);
            return throwError(() => err);
        })
    );
  }

  login(): Observable<void> {
    // Keep SDK for OAuth2 as approved
    return new Observable<void>(observer => {
        this.pb.collection('users').authWithOAuth2({ provider: 'synology' })
            .then(() => {
                observer.next();
                observer.complete();
            })
            .catch(err => observer.error(err));
    });
  }

  loginWithPassword(email: string, password: string): Observable<void> {
    const url = `/api/collections/users/auth-with-password`;
    return this.http.post<any>(url, { identity: email, password }).pipe(
        tap(res => {
            // Manually update session for interceptor and SDK
            const authData = { token: res.token, model: res.record };
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
            this.pb.authStore.save(res.token, res.record);
        }),
        map(() => undefined)
    );
  }

  logout(): Observable<void> {
    this.pb.authStore.clear();
    localStorage.removeItem(this.AUTH_KEY);
    return of(undefined);
  }

  addProfile(profile: Omit<Profile, 'id'>): Observable<Profile> {
    const authData = this.getStoredAuth();
    const userModel = authData?.model || authData?.record;
    
    if (!userModel) return throwError(() => new Error('Not authenticated'));
    const user = userModel;

    // 1. Create Profile in 'profiles' collection
    return this.http.post<any>(`/api/collections/profiles/records`, {
      ...profile,
      ownerId: user.id
    }).pipe(
      switchMap(profileRecord => {
        const newProfile: Profile = {
          id: profileRecord.id,
          name: profileRecord['name'],
          birthDate: profileRecord['birthDate'],
          themePreference: profileRecord['themePreference'],
          onboardingStep: profileRecord['onboardingStep']
        };

        // 2. Add Access to current User
        return this.http.patch<any>(`/api/collections/users/records/${user.id}`, {
          'profile_accesses+': [{
            profileId: newProfile.id,
            permission: 'owner'
          }]
        }).pipe(
          tap(updatedUser => {
            // Update stored user model (sync authStore)
            const currentAuth = this.getStoredAuth();
            if (currentAuth) {
                // Update BOTH model and record for max compatibility
                currentAuth.model = updatedUser;
                currentAuth.record = updatedUser; 
                localStorage.setItem(this.AUTH_KEY, JSON.stringify(currentAuth));
                this.pb.authStore.save(currentAuth.token, updatedUser);
            }
          }),
          map(() => newProfile)
        );
      })
    );
  }

  deleteProfile(profileId: string): Observable<void> {
    return this.http.delete(`/api/collections/profiles/records/${profileId}`).pipe(
      switchMap(() => this.getAuthUser()),
      tap(user => {
        const currentAuth = this.getStoredAuth();
        if (currentAuth && user) {
          currentAuth.model = user;
          currentAuth.record = user;
          localStorage.setItem(this.AUTH_KEY, JSON.stringify(currentAuth));
          this.pb.authStore.save(currentAuth.token, user as any);
        }
      }),
      map(() => undefined)
    );
  }

  isAuthenticated(): boolean {
    const auth = this.getStoredAuth();
    return !!(auth && auth.token);
  }

  getAuthUser(): Observable<User | null> {
    const auth = this.getStoredAuth();
    const userModel = auth?.model || auth?.record;

    if (!auth?.token || !userModel) {
      return of(null);
    }

    const model = userModel;
    const profileAccesses: ProfileAccess[] = model['profile_accesses'] || [];
    
    if (profileAccesses.length === 0) {
        return of(this.mapUser(model, []));
    }

    // Load actual profiles from 'profiles' collection
    const profileIds = profileAccesses.map(a => a.profileId);
    const filter = profileIds.map(id => `id="${id}"`).join(' || ');
    const url = `/api/collections/profiles/records`;
    
    return this.http.get<{ items: any[] }>(url, { params: { filter } }).pipe(
        map(res => {
            const profiles: Profile[] = res.items.map(r => ({
                id: r.id,
                name: r['name'],
                birthDate: r['birthDate'],
                themePreference: r['themePreference'],
                onboardingStep: r['onboardingStep']
            }));
            return this.mapUser(model, profiles);
        }),
        catchError(err => {
            console.error('[PocketbaseAuthAdapter] Failed to load profiles', err);
            return of(this.mapUser(model, []));
        })
    );
  }

  private getStoredAuth(): any {
    const data = localStorage.getItem(this.AUTH_KEY);
    if (!data) return null;
    try {
        const parsed = JSON.parse(data);
        // Compatibility check: PocketBase SDK standard is 'model', 
        // but some versions/manual saves use 'record'.
        return parsed;
    } catch {
        return null;
    }
  }

  private mapUser(model: any, profiles: Profile[]): User {
    return {
      id: model.id,
      email: model['email'],
      name: model['name'] || model['username'] || 'Utilisateur',
      profileAccesses: model['profile_accesses'] || [],
      profiles
    };
  }
}
