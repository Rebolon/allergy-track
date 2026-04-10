import { Component, PLATFORM_ID, inject, signal } from '@angular/core';

import { NgClass, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { GamificationService } from '../services/gamification.service';
import { ThemeService } from '../services/theme.service';
import { CopywritingService } from '../services/copywriting.service';
import { HealthStatus } from '../models/allergy-track.model';
import { LucideAngularModule } from 'lucide-angular';
import { PocketbaseAdapterService } from '../services/persistence/pocketbase-adapter.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, NgClass],
  template: `
    @if (status()) {
      <div class="p-6 rounded-3xl mb-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left transition-all shadow-sm border-2"
           [class.bg-emerald-50]="status()?.status === 'VERT'"
           [class.border-emerald-200]="status()?.status === 'VERT'"
           [class.bg-amber-50]="status()?.status === 'ORANGE'"
           [class.border-amber-200]="status()?.status === 'ORANGE'"
           [class.bg-rose-50]="status()?.status === 'ROUGE'"
           [class.border-rose-200]="status()?.status === 'ROUGE'">
        
        <div class="flex items-center gap-6 mb-6 md:mb-0">
          <div class="text-6xl animate-bounce">
            {{ status()?.status === 'VERT' ? '😎' : status()?.status === 'ORANGE' ? '🤔' : '🚨' }}
          </div>
          <div>
            <h3 class="text-2xl font-black"
                [class.text-emerald-800]="status()?.status === 'VERT'"
                [class.text-amber-800]="status()?.status === 'ORANGE'"
                [class.text-rose-800]="status()?.status === 'ROUGE'">
              {{ status()?.status === 'VERT' ? 'Super régularité !' : status()?.status === 'ORANGE' ? 'Attention requise' : 'Rendez-vous conseillé' }}
            </h3>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div class="flex flex-1 items-center justify-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-white shadow-sm whitespace-nowrap">
            <span class="text-3xl" title="Oublis">🍽️</span>
            <span class="text-3xl font-black text-slate-800">{{ status()?.misses }}</span>
            <span class="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Oublis</span>
          </div>
          <div class="flex flex-1 items-center justify-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-white shadow-sm whitespace-nowrap">
            <span class="text-3xl" title="Symptômes">🤒</span>
            <span class="text-3xl font-black text-slate-800">{{ status()?.symptomsCount }}</span>
            <span class="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Symptômes</span>
          </div>
        </div>
      </div>
    }

    <div [ngClass]="theme.cardClass()" class="p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-black flex items-center gap-3 text-[var(--color-primary)]">
          <span class="text-3xl">📊</span> Bilan Santé
        </h2>
      </div>

      <div class="flex flex-wrap gap-4 mb-8 p-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div class="flex flex-col flex-1 min-w-[150px]">
          <label for="startDate" class="text-sm font-bold mb-2 uppercase tracking-wider text-[var(--color-text-muted)]">Date de début</label>
          <input id="startDate" type="date" [(ngModel)]="startDate" (change)="loadStatus()" 
                 class="p-3 border border-[var(--color-border)] rounded-2xl bg-white focus:ring-2 focus:ring-[var(--color-primary-focus)] font-bold transition-all outline-none text-[var(--color-text)]">
        </div>
        <div class="flex flex-col flex-1 min-w-[150px]">
          <label for="endDate" class="text-sm font-bold mb-2 uppercase tracking-wider text-[var(--color-text-muted)]">Date de fin</label>
          <input id="endDate" type="date" [(ngModel)]="endDate" (change)="loadStatus()" 
                 class="p-3 border border-[var(--color-border)] rounded-2xl bg-white focus:ring-2 focus:ring-[var(--color-primary-focus)] font-bold transition-all outline-none text-[var(--color-text)]">
        </div>
      </div>

      <button (click)="exportReport()" class="w-full py-4 px-6 text-lg font-black transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3" [ngClass]="theme.primaryButton()">
        <span class="text-2xl">📥</span>
        Télécharger le rapport
      </button>
    </div>
  `
})
export class DashboardComponent {
  private reportService = inject(ReportService);
  private persistence = inject(PocketbaseAdapterService);
  gamification = inject(GamificationService);
  theme = inject(ThemeService);
  copy = inject(CopywritingService);
  private platformId = inject(PLATFORM_ID);

  startDate = new Date(new Date().setDate(1)).toISOString().split('T')[0]; // Fallback to current month
  endDate = new Date().toISOString().split('T')[0]; // Today

  status = signal<HealthStatus | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.persistence.getFirstEntryDate().subscribe({
        next: (date) => {
          if (date) {
            this.startDate = date;
          }
          this.loadStatus();
        },
        error: () => this.loadStatus()
      });
    }
  }

  loadStatus() {
    if (this.startDate && this.endDate) {
      this.reportService.getHealthStatus(this.startDate, this.endDate).subscribe(s => {
        this.status.set(s);
      });
    }
  }

  exportReport() {
    if (this.startDate && this.endDate) {
      this.reportService.downloadCsvReport(this.startDate, this.endDate);
    }
  }
}
