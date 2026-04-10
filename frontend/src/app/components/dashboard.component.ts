import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { GamificationService } from '../services/gamification.service';
import { ThemeService } from '../services/theme.service';
import { CopywritingService } from '../services/copywriting.service';
import { HealthStatus } from '../models/allergy-track.model';
import { MatIconModule } from '@angular/material/icon';
import { GamificationHistoryComponent } from './layout/gamification-history.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, MatIconModule, NgClass, GamificationHistoryComponent],
  template: `
    <app-gamification-history [state]="gState()" />

    <div [ngClass]="theme.cardClass()" class="p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-black flex items-center gap-3" [class.text-violet-800]="theme.persona() === 'child'">
          <span class="text-3xl">📊</span> Bilan Santé
        </h2>
      </div>

      <div class="flex flex-wrap gap-4 mb-8 p-5 rounded-3xl border-2" [class.bg-violet-50]="theme.persona() === 'child'" [class.border-violet-100]="theme.persona() === 'child'" [class.bg-slate-50]="theme.persona() !== 'child'" [class.border-slate-200]="theme.persona() !== 'child'">
        <div class="flex flex-col flex-1 min-w-[150px]">
          <label for="startDate" class="text-sm font-bold mb-2 uppercase tracking-wider" [class.text-violet-600]="theme.persona() === 'child'" [class.text-slate-600]="theme.persona() !== 'child'">Date de début</label>
          <input id="startDate" type="date" [(ngModel)]="startDate" (change)="loadStatus()" class="p-3 border-2 rounded-2xl bg-white focus:ring-4 font-bold transition-all outline-none" [class.border-violet-200]="theme.persona() === 'child'" [class.focus:ring-violet-100]="theme.persona() === 'child'" [class.focus:border-violet-400]="theme.persona() === 'child'" [class.text-violet-900]="theme.persona() === 'child'" [class.border-slate-200]="theme.persona() !== 'child'" [class.focus:ring-slate-100]="theme.persona() !== 'child'" [class.focus:border-slate-400]="theme.persona() !== 'child'" [class.text-slate-800]="theme.persona() !== 'child'">
        </div>
        <div class="flex flex-col flex-1 min-w-[150px]">
          <label for="endDate" class="text-sm font-bold mb-2 uppercase tracking-wider" [class.text-violet-600]="theme.persona() === 'child'" [class.text-slate-600]="theme.persona() !== 'child'">Date de fin</label>
          <input id="endDate" type="date" [(ngModel)]="endDate" (change)="loadStatus()" class="p-3 border-2 rounded-2xl bg-white focus:ring-4 font-bold transition-all outline-none" [class.border-violet-200]="theme.persona() === 'child'" [class.focus:ring-violet-100]="theme.persona() === 'child'" [class.focus:border-violet-400]="theme.persona() === 'child'" [class.text-violet-900]="theme.persona() === 'child'" [class.border-slate-200]="theme.persona() !== 'child'" [class.focus:ring-slate-100]="theme.persona() !== 'child'" [class.focus:border-slate-400]="theme.persona() !== 'child'" [class.text-slate-800]="theme.persona() !== 'child'">
        </div>
      </div>

      @if (status()) {
        <div class="p-8 rounded-3xl mb-8 flex flex-col items-center justify-center text-center transition-all transform hover:scale-[1.02] border-4"
             [class.bg-emerald-50]="status()?.status === 'VERT'"
             [class.border-emerald-200]="status()?.status === 'VERT'"
             [class.bg-amber-50]="status()?.status === 'ORANGE'"
             [class.border-amber-200]="status()?.status === 'ORANGE'"
             [class.bg-rose-50]="status()?.status === 'ROUGE'"
             [class.border-rose-200]="status()?.status === 'ROUGE'">
          
          <div class="text-6xl mb-4 animate-bounce">
            {{ status()?.status === 'VERT' ? '😎' : status()?.status === 'ORANGE' ? '🤔' : '🚨' }}
          </div>
          
          <h3 class="text-3xl font-black mb-2"
              [class.text-emerald-800]="status()?.status === 'VERT'"
              [class.text-amber-800]="status()?.status === 'ORANGE'"
              [class.text-rose-800]="status()?.status === 'ROUGE'">
            Statut {{ status()?.status }}
          </h3>
          
          <div class="flex gap-4 mt-6 w-full max-w-md">
            <div class="flex-1 flex flex-col items-center bg-white/60 backdrop-blur-sm p-4 rounded-2xl border-2 border-white shadow-sm">
              <span class="text-3xl mb-2">🍽️</span>
              <span class="text-3xl font-black text-slate-800">{{ status()?.misses }}</span>
              <span class="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Oublis</span>
            </div>
            <div class="flex-1 flex flex-col items-center bg-white/60 backdrop-blur-sm p-4 rounded-2xl border-2 border-white shadow-sm">
              <span class="text-3xl mb-2">🤒</span>
              <span class="text-3xl font-black text-slate-800">{{ status()?.symptomsCount }}</span>
              <span class="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Symptômes</span>
            </div>
          </div>
        </div>
      }

      <button (click)="exportReport()" class="w-full py-4 px-6 text-lg font-black transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3" [ngClass]="theme.primaryButton()">
        <span class="text-2xl">📥</span>
        Télécharger le rapport
      </button>
    </div>
  `
})
export class DashboardComponent {
  private reportService = inject(ReportService);
  gamification = inject(GamificationService);
  theme = inject(ThemeService);
  copy = inject(CopywritingService);
  private platformId = inject(PLATFORM_ID);

  gState = toSignal(this.gamification.getGamificationState(), { initialValue: null });

  startDate = new Date(new Date().setDate(1)).toISOString().split('T')[0]; // First day of current month
  endDate = new Date().toISOString().split('T')[0]; // Today

  status = signal<HealthStatus | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStatus();
    }
  }

  loadStatus() {
    if (this.startDate && this.endDate) {
      this.reportService.getHealthStatus(this.startDate, this.endDate).subscribe(s => {
        this.status.set(s);
      });
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'VERT': return 'check_circle';
      case 'ORANGE': return 'warning';
      case 'ROUGE': return 'error';
      default: return 'help';
    }
  }

  exportReport() {
    if (this.startDate && this.endDate) {
      this.reportService.downloadCsvReport(this.startDate, this.endDate);
    }
  }
}
