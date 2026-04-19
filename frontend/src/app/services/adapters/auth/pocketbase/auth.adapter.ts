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
    
    // Sync user name
    return this.http.patch(`/api/collections/users/records/${userId}`, {
        name: updatedUser.name
    }).pipe(map(() => undefined));
  }

  updateProfile(profile: Profile): Observable<void> {
    // On extrait uniquement les champs définis pour permettre un patch partiel
    const { id, ...data } = profile;
    
    return this.http.patch<any>(`/api/collections/profiles/records/${id}`, data).pipe(
        map(() => undefined),
        catchError(err => {
            console.error('[PocketbaseAuthAdapter] Profile update failed', err);
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

        // 2. Add Access entry in 'accesses' collection
        return this.http.post<any>(`/api/collections/accesses/records`, {
          userId: user.id,
          profileId: newProfile.id,
          role: 'owner'
        }).pipe(
          map(() => newProfile)
        );
      })
    );
  }

  deleteProfile(profileId: string): Observable<void> {
    // PocketBase handles cascadeDelete if configured in relations
    return this.http.delete(`/api/collections/profiles/records/${profileId}`).pipe(
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
    
    // Load accesses and expand profiles
    const filter = `userId="${model.id}"`;
    const expand = 'profileId';
    const url = `/api/collections/accesses/records`;
    
    return this.http.get<{ items: any[] }>(url, { params: { filter, expand } }).pipe(
        map(res => {
            const profileAccesses: ProfileAccess[] = res.items.map(item => ({
                profileId: item.profileId,
                permission: item.role,
                colorCode: item.colorCode // optionnel
            }));
            
            const profiles: Profile[] = res.items
                .filter(item => item.expand && item.expand.profileId)
                .map(item => {
                    const p = item.expand.profileId;
                    return {
                        id: p.id,
                        name: p.name,
                        birthDate: p.birthDate,
                        themePreference: p.themePreference,
                        onboardingStep: p.onboardingStep
                    };
                });

            return this.mapUser(model, profiles, profileAccesses);
        }),
        catchError(err => {
            console.error('[PocketbaseAuthAdapter] Failed to load accesses', err);
            return of(this.mapUser(model, [], []));
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

  private mapUser(model: any, profiles: Profile[], profileAccesses: ProfileAccess[]): User {
    return {
      id: model.id,
      email: model['email'],
      name: model['name'] || model['username'] || 'Utilisateur',
      profileAccesses,
      profiles
    };
  }
}
