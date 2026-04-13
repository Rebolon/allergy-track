import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, first } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

/**
 * Guard to redirect to welcome page if the user is not authenticated.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.isReady).pipe(
    filter(isReady => isReady),
    first(),
    map(() => {
      if (!auth.isAuthenticated()) {
        return router.parseUrl('/welcome');
      }
      return true;
    })
  );
};
