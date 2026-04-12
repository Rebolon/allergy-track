import { Routes } from '@angular/router';
import { HomeViewComponent } from './components/home-view.component';
import { SupervisionViewComponent } from './components/supervision-view.component';
import { GamingViewComponent } from './components/gaming-view.component';
import { SettingsComponent } from './components/settings.component';
import { OnboardingComponent } from './components/onboarding.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (!auth.isAuthenticated()) return router.createUrlTree(['/']);
      return true;
    }]
  },
  {
    path: 'home',
    component: HomeViewComponent,
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (!auth.isAuthenticated()) return router.createUrlTree(['/']);
      if (auth.currentUser()?.profileAccesses?.length === 0) return router.createUrlTree(['/onboarding']);
      return true;
    }]
  },
  {
    path: 'supervision',
    component: SupervisionViewComponent,
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (!auth.isAuthenticated()) return router.createUrlTree(['/']);
      if (auth.currentUser()?.profileAccesses?.length === 0) return router.createUrlTree(['/onboarding']);
      return true;
    }]
  },
  {
    path: 'gaming',
    component: GamingViewComponent,
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (!auth.isAuthenticated()) return router.createUrlTree(['/']);
      if (auth.currentUser()?.profileAccesses?.length === 0) return router.createUrlTree(['/onboarding']);
      return true;
    }]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (!auth.isAuthenticated()) return router.createUrlTree(['/']);
      if (auth.currentUser()?.profileAccesses?.length === 0) return router.createUrlTree(['/onboarding']);
      return true;
    }]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];
