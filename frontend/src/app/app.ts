import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';
import { GamificationService } from './services/gamification.service';
import { CopywritingService } from './services/copywriting.service';
import { MatIconModule } from '@angular/material/icon';
import { LayoutHeaderComponent } from './components/layout/header.component';
import { LayoutFooterComponent } from './components/layout/footer.component';
import { GlobalErrorModalComponent } from './components/layout/global-error-modal.component';
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
    MatIconModule
  ],
  template: `
    @if (auth.isInitialized()) {
      @if (isOnboarding() || isWelcome() || !auth.isAuthenticated() || auth.needsOnboarding()) {
        <!-- Isolated Layout for Welcome and Onboarding (or while redirecting) -->
        <main>
          <router-outlet />
        </main>
      } @else {
        <!-- Main Application Layout -->
        <div class="min-h-screen pb-24 md:pb-12 transition-colors duration-500 bg-[var(--color-background)] text-[var(--color-text)] font-sans">
          
          <app-layout-header />

          <app-top-nav />

          <main class="max-w-5xl mx-auto px-4 pt-5 md:pt-0 pb-8">
            <router-outlet />
            <app-layout-footer class="hidden md:block mt-8" />
          </main>

          <app-bottom-nav />

          @if (errorService.serverError(); as serverErrorMsg) {
            <app-global-error-modal [message]="serverErrorMsg" />
          }
        </div> 
      }
    } @else {
      <!-- Neutral state during bootstrap -->
      <div class="min-h-screen bg-white"></div>
    }
  `
})
export class App implements OnInit {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  notification = inject(NotificationService);
  gamification = inject(GamificationService);
  copy = inject(CopywritingService);
  errorService = inject(ErrorService);
  router = inject(Router);

  // Navigation State reactively linked to Router
  url = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(e => (e as NavigationEnd).urlAfterRedirects),
    startWith(this.router.url)
  ), { initialValue: this.router.url });

  isOnboarding = computed(() => this.url().includes('/onboarding'));
  isWelcome = computed(() => this.url().includes('/welcome'));
  
  activeTab = computed<MobileTab>(() => {
    const current = this.url();
    if (current.includes('/home')) return 'home';
    if (current.includes('/supervision')) return 'supervision';
    if (current.includes('/gaming')) return 'gaming';
    if (current.includes('/settings')) return 'preferences';
    return 'home';
  });

  constructor() {
    // Handle global tab change requests
    (window as any).dispatchTabChange = (tab: MobileTab) => {
      const route = tab === 'preferences' ? 'settings' : tab;
      this.router.navigate([`/${route}`]);
    };
  }

  ngOnInit() {
    this.notification.init();
  }
}
