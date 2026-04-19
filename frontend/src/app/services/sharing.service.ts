import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { PermissionLevel } from '../models/allergy-track.model';
import { SHARING_ADAPTER } from './sharing.interface';

@Injectable({
  providedIn: 'root'
})
export class SharingService {
  private auth = inject(AuthService);
  private adapter = inject(SHARING_ADAPTER);

  /**
   * Generates a random code for sharing a dossier.
   */
  public generateInviteCode(profileId: string, role: PermissionLevel): Observable<string> {
    return this.adapter.createInvite(profileId, role);
  }

  /**
   * Joins a dossier using an invite code.
   */
  public joinDossier(code: string): Observable<void> {
    return this.adapter.consumeInvite(code).pipe(
      switchMap(() => this.auth.checkSession()),
      map(() => undefined)
    );
  }
}
