import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, first } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

/**
 * Guard to redirect to onboarding if the user has no profiles.
 */
export const onboardingGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.isReady).pipe(
    filter(isReady => isReady),
    first(),
    map(() => {
      if (auth.needsOnboarding()) {
        if (!state.url.includes('/onboarding')) {
          return router.parseUrl('/onboarding');
        }
      }

      return true;
    })
  );
};
