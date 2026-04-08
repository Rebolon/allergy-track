import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
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
import { SettingsModalComponent } from './components/layout/settings-modal.component';
import { GlobalErrorModalComponent } from './components/layout/global-error-modal.component';
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
    GamificationSummaryComponent,
    SettingsModalComponent,
    GlobalErrorModalComponent,
    MatIconModule,
    NgClass
  ],
  template: `
    <div class="min-h-screen pb-12 transition-colors duration-500" [ngClass]="[theme.bgClass(), theme.textClass(), theme.fontClass()]">
      
      <!-- Header / Auth Switcher -->
      <app-layout-header (onOpenSettings)="openSettings()" />

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 py-8">

        <app-gamification-summary [state]="gState()" />
        
        <!-- Enfant View (Agenda + Daily Entry) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <div class="md:col-span-4">
            <app-agenda (dateSelected)="onDateSelected($event)" />
            
            @if (auth.currentUser().role === 'Adulte') {
              <div class="mt-6">
                <app-dashboard />
              </div>
            }
          </div>
          
          <div class="md:col-span-8">
            <app-daily-entry [date]="selectedDate()" />

            @if (auth.currentUser().role === 'Adulte') {
              <div class="mt-6">
                <app-audit-log />
              </div>
            }
          </div>
          
        </div>
        
        <!-- Footer -->
        <app-layout-footer />
        
      </main>

      <!-- Modals -->
      @if (showSettings()) {
        <app-settings-modal [initialTheme]="currentTheme()" (onClose)="showSettings.set(false)" (onSave)="saveSettings($event)" />
      }

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
  showSettings = signal(false);
  currentTheme = signal<'flashy' | 'classic'>('flashy');

  gState = toSignal(this.gamification.getGamificationState().pipe(startWith(null)), { initialValue: null });

  ngOnInit() {
    this.notification.init();
    const suiviUser = this.auth.getUsers().find(u => u.id === 'u2');
    if (suiviUser) {
      this.currentTheme.set(suiviUser.themePreference);
    }
  }

  openSettings() {
    const suiviUser = this.auth.getUsers().find(u => u.id === 'u2');
    if (suiviUser) {
      this.currentTheme.set(suiviUser.themePreference);
    }
    this.showSettings.set(true);
  }

  saveSettings(newTheme: 'flashy' | 'classic') {
    this.auth.updateSuiviTheme(newTheme);
    this.showSettings.set(false);
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
  }
}
