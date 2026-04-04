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
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { VERSION } from '../environments/version';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    AgendaComponent,
    DailyEntryComponent,
    DashboardComponent,
    AuditLogComponent,
    MatIconModule,
    NgClass
],
  template: `
    <div class="min-h-screen pb-12 transition-colors duration-500" [ngClass]="[theme.bgClass(), theme.textClass(), theme.fontClass()]">
      
      <!-- Header / Auth Switcher -->
      <header class="text-white shadow-lg sticky top-0 z-10 transition-colors duration-500" [ngClass]="theme.headerGradient()">
        <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight">
            <img src="/icons/favicon-96x96.png" alt="Logo" class="w-10 h-10 md:w-12 md:h-12 bg-white/20 p-1.5 rounded-2xl backdrop-blur-sm object-contain" />
            AllergyTrack
          </h1>
          
          <div class="flex items-center gap-2 bg-white/20 p-1.5 rounded-2xl backdrop-blur-sm">
            @for (user of auth.getUsers(); track user.id) {
              <button
                  (click)="switchUser(user.id)"
                  class="px-4 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105"
                  [class.bg-white]="auth.currentUser().id === user.id"
                  [class.text-violet-600]="auth.currentUser().id === user.id && theme.persona() === 'child'"
                  [class.text-indigo-600]="auth.currentUser().id === user.id && theme.persona() === 'teen'"
                  [class.text-slate-800]="auth.currentUser().id === user.id && theme.persona() === 'adult'"
                  [class.shadow-md]="auth.currentUser().id === user.id"
                  [class.text-white]="auth.currentUser().id !== user.id"
                  [class.hover:bg-white/20]="auth.currentUser().id !== user.id">
              {{ user.name }}
              </button>
            }
            <button (click)="openSettings()" class="p-2 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center justify-center">
                <mat-icon>settings</mat-icon>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 py-8">

        @if (theme.persona() !== 'adult') {
          @if (gState(); as g) {
            <div class="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
              @if (g.regularStreak > 0) {
                <div class="flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xl border-2 shadow-sm"
                     [class.bg-orange-100]="theme.persona() === 'child'"
                     [class.text-orange-600]="theme.persona() === 'child'"
                     [class.border-orange-200]="theme.persona() === 'child'"
                     [class.bg-blue-50]="theme.persona() === 'teen'"
                     [class.text-blue-600]="theme.persona() === 'teen'"
                     [class.border-blue-200]="theme.persona() === 'teen'">
                  <span class="text-3xl animate-bounce">🔥</span>
                  {{ copy.streakTitle() }} {{ g.regularStreak }}
                </div>
              } @else if (g.hasPreviousRecords && g.hasMissedYesterday) {
                <div class="flex items-center justify-center gap-3 p-4 rounded-2xl font-bold text-lg border-2 shadow-sm"
                     [class.bg-rose-100]="theme.persona() === 'child'"
                     [class.text-rose-700]="theme.persona() === 'child'"
                     [class.border-rose-200]="theme.persona() === 'child'"
                     [class.bg-red-50]="theme.persona() === 'teen'"
                     [class.text-red-600]="theme.persona() === 'teen'"
                     [class.border-red-200]="theme.persona() === 'teen'">
                  <span class="text-2xl">⚠️</span>
                  {{ copy.streakBrokenMessage() }}
                </div>
              }

              @if (g.perfectStreak > 0) {
                <div class="flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xl border-2 shadow-sm"
                     [class.bg-amber-100]="theme.persona() === 'child'"
                     [class.text-amber-600]="theme.persona() === 'child'"
                     [class.border-amber-200]="theme.persona() === 'child'"
                     [class.bg-blue-50]="theme.persona() === 'teen'"
                     [class.text-blue-600]="theme.persona() === 'teen'"
                     [class.border-blue-200]="theme.persona() === 'teen'">
                  <span class="text-3xl animate-bounce">⭐</span>
                  Parfait {{ g.perfectStreak }}
                </div>
              }
            </div>
          }
        }
        
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
        <footer class="mt-12 pt-8 border-t border-slate-200/50 text-center pb-8 opacity-50 hover:opacity-100 transition-opacity">
          <p class="text-xs font-medium tracking-wide flex flex-col gap-1">
            <span>© 2024-{{currentYear}} AllergyTrack • Tous droits réservés</span>
            <span class="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-full inline-block mx-auto">
              v.{{version.buildDate}} ({{version.hash}})
            </span>
          </p>
        </footer>
        
      </main>

      <!-- Settings Modal -->
      @if (showSettings()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-slate-800">
            <h2 class="text-2xl font-black mb-6">Affichage</h2>
            <div class="mb-8 space-y-4">
              <span class="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">Sélecteur de Thème</span>
              
              <!-- Option: Flashy -->
              <label class="relative flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer hover:bg-violet-50 transition-all font-bold"
                     [class.border-violet-500]="currentTheme() === 'flashy'"
                     [class.bg-violet-50]="currentTheme() === 'flashy'"
                     [class.border-slate-100]="currentTheme() !== 'flashy'">
                <div class="flex items-center gap-4">
                  <div class="text-4xl">🌈</div>
                  <div class="flex flex-col">
                    <span class="text-slate-800 text-lg">Flashy</span>
                    <span class="text-xs font-bold text-slate-400">Couleurs vives et amusantes</span>
                  </div>
                </div>
                <input type="radio" name="theme" value="flashy" [checked]="currentTheme() === 'flashy'" (change)="currentTheme.set('flashy')" class="w-6 h-6 accent-violet-600 focus:ring-violet-500 border-gray-300">
              </label>

              <!-- Option: Classic -->
              <label class="relative flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all font-bold"
                     [class.border-blue-500]="currentTheme() === 'classic'"
                     [class.bg-blue-50]="currentTheme() === 'classic'"
                     [class.border-slate-100]="currentTheme() !== 'classic'">
                <div class="flex items-center gap-4">
                  <div class="text-4xl">🕶️</div>
                  <div class="flex flex-col">
                    <span class="text-slate-800 text-lg">Classique</span>
                    <span class="text-xs font-bold text-slate-400">Design sombre et épuré</span>
                  </div>
                </div>
                <input type="radio" name="theme" value="classic" [checked]="currentTheme() === 'classic'" (change)="currentTheme.set('classic')" class="w-6 h-6 accent-blue-600 focus:ring-blue-500 border-gray-300">
              </label>
            </div>
            <div class="flex justify-end gap-3 mt-4">
              <button (click)="showSettings.set(false)" class="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold transition-colors">Fermer</button>
              <button (click)="saveSettings()" class="px-6 py-3 rounded-xl text-white font-bold transition-colors shadow-lg" [ngClass]="theme.primaryButton()">Enregistrer</button>
            </div>
          </div>
        </div>
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
  
  version = VERSION;
  currentYear = new Date().getFullYear();

  selectedDate = signal(new Date().toISOString().split('T')[0]);
  showSettings = signal(false);
  currentTheme = signal<'flashy' | 'classic'>('flashy');
  
  gState = toSignal(this.gamification.getGamificationState().pipe(startWith(null)));

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

  saveSettings() {
    this.auth.updateSuiviTheme(this.currentTheme());
    this.showSettings.set(false);
  }

  switchUser(id: string) {
    this.auth.switchSpecificUser(id);
  }

  onDateSelected(date: string) {
    this.selectedDate.set(date);
  }
}
