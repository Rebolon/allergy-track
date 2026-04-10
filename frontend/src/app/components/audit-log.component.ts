import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PocketbaseAdapterService } from '../services/persistence/pocketbase-adapter.service';
import { DailyLog } from '../models/allergy-track.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [MatIconModule, DatePipe],
  template: `
    <div class="bg-white rounded-3xl shadow-xl shadow-violet-100/50 p-6 border-4 border-white">
      <h2 class="text-2xl font-black text-violet-800 mb-6 flex items-center gap-3">
        <span class="text-3xl">📜</span> Historique des Saisies
      </h2>

      <div class="space-y-4">
        @for (log of logs(); track log.id + log.updatedAt) {
          <div class="p-4 rounded-2xl border-2 border-violet-100 bg-violet-50/30 hover:bg-violet-50 transition-colors">
            <div class="flex justify-between items-start mb-2">
              <div class="flex flex-col">
                <span class="font-black text-violet-900">{{ log.date | date:'dd/MM/yyyy' }}</span>
                <span class="text-xs font-bold text-violet-400 uppercase tracking-tighter">Saisi par {{ log.updatedBy }}</span>
              </div>
              <span class="text-[10px] font-medium text-violet-300">{{ log.updatedAt | date:'HH:mm:ss' }}</span>
            </div>
            
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                🍽️ {{ getTakenCount(log) }}/{{ log.intakes.length }}
              </span>
              <span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                🤒 {{ log.symptoms.length }}
              </span>
              @if (log.note) {
                <span class="text-xs text-slate-500 italic line-clamp-1 flex-1">"{{ log.note }}"</span>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-8 text-slate-400 font-medium">
            Aucun historique disponible pour le moment.
          </div>
        }
      </div>

      @if (totalItems() > logs().length) {
        <button 
          (click)="loadMore()" 
          [disabled]="loading()"
          class="w-full mt-6 py-3 px-6 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          @if (loading()) {
            <span class="animate-spin text-xl">⏳</span>
          } @else {
            <span>Charger plus</span>
          }
        </button>
      } @else if (logs().length > 0) {
        <div class="text-center mt-6 text-sm font-bold text-slate-300">
          ✨ Vous êtes arrivé au bout de l'historique ✨
        </div>
      }
    </div>
  `
})
export class AuditLogComponent implements OnInit {
  private persistence = inject(PocketbaseAdapterService);

  logs = signal<DailyLog[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  loading = signal(false);
  perPage = 10;

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading.set(true);
    this.persistence.getPaginatedDailyLogs(this.currentPage(), this.perPage).subscribe({
      next: (result) => {
        if (this.currentPage() === 1) {
          this.logs.set(result.items);
        } else {
          this.logs.set([...this.logs(), ...result.items]);
        }
        this.totalItems.set(result.totalItems);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore() {
    this.currentPage.update(p => p + 1);
    this.loadLogs();
  }

  getTakenCount(log: DailyLog): number {
    return log.intakes.filter(i => i.taken).length;
  }
}
