import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';
import { CopywritingService } from './services/copywriting.service';
import { MatIconModule } from '@angular/material/icon';
import { LayoutHeaderComponent } from './components/layout/header.component';
import { LayoutFooterComponent } from './components/layout/footer.component';
import { GlobalErrorModalComponent } from './components/layout/global-error-modal.component';
import { SplashScreenComponent } from './components/splash-screen.component';
import { TopNavComponent } from './components/layout/top-nav.component';
import { BottomNavComponent, MobileTab } from './components/layout/bottom-nav.component';
import { ErrorService } from './services/error.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LayoutHeaderComponent,
    LayoutFooterComponent,
    BottomNavComponent,
    TopNavComponent,
    GlobalErrorModalComponent,
    SplashScreenComponent,
    MatIconModule
  ],
  template: `
    <!-- Splash Screen Gate -->
    <app-splash-screen />

    @if (auth.isAuthenticated()) {
      <div class="min-h-screen pb-24 md:pb-12 transition-colors duration-500 bg-[var(--color-background)] text-[var(--color-text)] font-sans">
        
        <!-- Header / Auth Switcher -->
        <app-layout-header />

        <!-- Desktop Nav -->
        <app-top-nav></app-top-nav>

        <!-- Main Content -->
        <main class="max-w-5xl mx-auto px-4 pt-5 md:pt-0 pb-8">
          
          <router-outlet />
          
          <!-- Footer -->
          <app-layout-footer class="hidden md:block mt-8" />
          
        </main>

        <!-- Bottom Nav (Bottom Only) -->
        <app-bottom-nav></app-bottom-nav>

        <!-- Modals -->
        @if (errorService.serverError(); as serverErrorMsg) {
          <app-global-error-modal [message]="serverErrorMsg" />
        }
      </div> 
    }
  `
})
export class App implements OnInit {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  notification = inject(NotificationService);
  copy = inject(CopywritingService);
  errorService = inject(ErrorService);
  router = inject(Router);

  // Navigation State (mostly for legacy sync if needed, but updated via URL)
  activeTab = signal<MobileTab>('home');

  constructor() {
    /** @todo is it really needed? I comment for instance*/
    /* */
    // Sync activeTab with URL for components that might still use it
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      if (url.includes('/home')) this.activeTab.set('home');
      else if (url.includes('/supervision')) this.activeTab.set('supervision');
      else if (url.includes('/gaming')) this.activeTab.set('gaming');
      else if (url.includes('/settings')) this.activeTab.set('preferences');
    });

    (window as any).dispatchTabChange = (tab: MobileTab) => {
      const route = tab === 'preferences' ? 'settings' : tab;
      this.router.navigate([`/${route}`]);
    };
    /* */
  }

  ngOnInit() {
    this.notification.init();
  }
}
