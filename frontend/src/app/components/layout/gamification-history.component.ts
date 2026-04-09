import { Component, inject, input } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { GamificationState } from '../../services/gamification.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-gamification-history',
  standalone: true,
  imports: [NgClass, DatePipe],
  template: `
    @if (state() && state()!.history.length > 0) {
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border-4 border-slate-50 mb-6">
        <h3 class="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <span class="text-2xl">🎮</span> Explication du Score
        </h3>

        <div class="relative">
          <!-- Ligne verticale de connexion -->
          <div class="absolute left-6 top-4 bottom-4 w-1 bg-slate-100 rounded-full"></div>

          <div class="space-y-6 relative">
            @for (event of state()!.history; track event.date) {
              <div class="flex gap-4 items-start group">
                <!-- Icone de statut -->
                <div class="z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-transform group-hover:scale-110 shrink-0"
                     [ngClass]="{
                       'bg-orange-50 border-orange-200 text-orange-500': event.type === 'flame',
                       'bg-amber-50 border-amber-200 text-amber-500': event.type === 'star' && !event.isBroken,
                       'bg-rose-50 border-rose-200 text-rose-500': event.isBroken
                     }">
                  @if (event.isBroken) {
                    <span class="text-2xl">💔</span>
                  } @else {
                    <span class="text-2xl">{{ event.type === 'star' ? '⭐' : '🔥' }}</span>
                  }
                </div>

                <!-- Détails -->
                <div class="flex-1 pt-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-black text-slate-400 uppercase tracking-wider">{{ event.date | date:'dd MMMM' }}</span>
                    @if (event.change > 0) {
                      <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black">+1 {{ event.type === 'star' ? 'Étoile' : 'Jour' }}</span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-black">Série arrêtée</span>
                    }
                  </div>
                  <p class="text-slate-700 font-bold leading-tight">{{ event.reason }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="mt-8 p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 flex gap-3 items-center">
            <span class="text-2xl">💡</span>
            <p class="text-xs font-bold text-blue-700 leading-relaxed">
                Le score remonte jusqu'à ta dernière erreur. Pour passer à l'unité **Semaines (Étoiles)**, il faut 7 jours parfaits d'affilée !
            </p>
        </div>
      </div>
    }
  `
})
export class GamificationHistoryComponent {
  theme = inject(ThemeService);
  state = input<GamificationState | null>(null);
}
