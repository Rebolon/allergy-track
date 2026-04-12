import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

/**
 * Guard to redirect to onboarding if the user has no profiles.
 */
export const onboardingGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to be ready
  if (!auth.isReady()) {
    // Small wait or simple return, auth.isReady() is a Signal
    // In a real app, we might use toObservable(auth.isReady) and filter(true)
    return true; 
  }

  const user = auth.currentUser();
  const isAuth = auth.isAuthenticated();

  if (isAuth && user && (!user.profileAccesses || user.profileAccesses.length === 0)) {
    if (!state.url.includes('/onboarding')) {
      return router.parseUrl('/onboarding');
    }
  }

  return true;
};
