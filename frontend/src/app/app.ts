import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { AgendaComponent } from './components/agenda.component';
import { DailyEntryComponent } from './components/daily-entry.component';
import { DashboardComponent } from './components/dashboard.component';
import { AuditLogComponent } from './components/audit-log.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';
import { GamificationService } from './services/gamification.service';
import { CopywritingService } from './services/copywriting.service';
import { MatIconModule } from '@angular/material/icon';
import { LayoutHeaderComponent } from './components/layout/header.component';
import { LayoutFooterComponent } from './components/layout/footer.component';
import { GamificationSummaryComponent } from './components/layout/gamification-summary.component';
import { GamificationHistoryComponent } from './components/layout/gamification-history.component';
import { SettingsComponent } from './components/settings.component';
import { GlobalErrorModalComponent } from './components/layout/global-error-modal.component';
import { TopNavComponent } from './components/layout/top-nav.component';
import { BottomNavComponent, MobileTab } from './components/layout/bottom-nav.component';
import { ErrorService } from './services/error.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    AgendaComponent,
    DailyEntryComponent,
    DashboardComponent,
    AuditLogComponent,
    LayoutHeaderComponent,
    LayoutFooterComponent,
    BottomNavComponent,
    GamificationSummaryComponent,
    GamificationHistoryComponent,
    SettingsComponent,
    TopNavComponent,
    GlobalErrorModalComponent,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen pb-24 md:pb-12 transition-colors duration-500 bg-[var(--color-background)] text-[var(--color-text)] font-sans">
      
      <!-- Header / Auth Switcher -->
      <app-layout-header />

      <!-- Desktop Nav -->
      <app-top-nav [activeTab]="activeTab()" (onTabChange)="setTab($event)"></app-top-nav>

      <!-- Main Content -->
      <main class="max-w-5xl mx-auto px-4 pt-5 md:pt-0 pb-8">

        <!-- Gamification Summary (Home + Gaming) -->
        <div class="mb-6" [class.hidden]="activeTab() !== 'gaming' && activeTab() !== 'home'">
           <app-gamification-summary [state]="gState()" />
        </div>
        
        <!-- Gamification History (Gaming only) -->
        <div class="mb-6 flex flex-col gap-6" [class.hidden]="activeTab() !== 'gaming'">
           <app-gamification-history [state]="gState()" />
        </div>

        <!-- Preferences Tab -->
        <div class="mb-6 flex flex-col gap-6" [class.hidden]="activeTab() !== 'preferences'">
           <app-settings />
        </div>
        
        <!-- Supervision Tab (Full Width) -->
        <div class="mb-6 flex flex-col gap-6" [class.hidden]="activeTab() !== 'supervision'">
           <app-dashboard />
           <app-audit-log />
        </div>
        
        <!-- Home View (Agenda + Daily Entry) -->
        <div class="flex flex-col gap-6" [class.hidden]="activeTab() !== 'home'">
          
          <!-- Agenda -->
          <app-agenda (dateSelected)="onDateSelected($event)" />
          
          <!-- Daily Entry Form -->
          <app-daily-entry [date]="selectedDate()" />
          
        </div>
        
        <!-- Footer -->
        <app-layout-footer class="hidden md:block mt-8" />
        
      </main>

      <!-- Bottom Nav (Mobile Only) -->
      <app-bottom-nav [activeTab]="activeTab()" (onTabChange)="setTab($event)"></app-bottom-nav>

      <!-- Modals -->
      @if (errorService.serverError(); as serverErrorMsg) {
        <app-global-error-modal [message]="serverErrorMsg" />
      }
    </div>
  `
})
export class App implements OnInit {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  notification = inject(NotificationService);
  gamification = inject(GamificationService);
  copy = inject(CopywritingService);
  errorService = inject(ErrorService);

  currentYear = new Date().getFullYear();

  selectedDate = signal(this.getTodayStr());

  // Mobile Navigation State
  activeTab = signal<MobileTab>('home');

  gState = toSignal(this.gamification.getGamificationState().pipe(startWith(null)), { initialValue: null });

  ngOnInit() {
    this.notification.init();
  }

  setTab(tab: MobileTab) {
    this.activeTab.set(tab);
  }

  getTodayStr(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onDateSelected(date: string) {
    this.selectedDate.set(date);
    // Switch to entry form automatically on mobile when a date is selected from Agenda
    this.activeTab.set('home');
  }
}

