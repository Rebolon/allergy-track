import { Routes } from '@angular/router';
import { HomeViewComponent } from './components/home-view.component';
import { SupervisionViewComponent } from './components/supervision-view.component';
import { GamingViewComponent } from './components/gaming-view.component';
import { SettingsComponent } from './components/settings.component';
import { OnboardingComponent } from './components/onboarding.component';
import { onboardingGuard } from './onboarding.guard';

export const routes: Routes = [
  { path: 'onboarding', component: OnboardingComponent },
  { 
    path: '', 
    canActivate: [onboardingGuard],
    children: [
      { path: 'home', component: HomeViewComponent },
      { path: 'supervision', component: SupervisionViewComponent },
      { path: 'gaming', component: GamingViewComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ]
  },
  { path: '**', redirectTo: 'home' }
];
