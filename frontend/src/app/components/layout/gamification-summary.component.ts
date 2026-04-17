import { Component, inject, input } from '@angular/core';
import { GamificationState } from '../../services/gamification.service';
import { ThemeService } from '../../services/theme.service';
import { CopywritingService } from '../../services/copywriting.service';

@Component({
  selector: 'app-gamification-summary',
  standalone: true,
  template: `
    @if (state()) {
      @let g = state()!;
      <div class="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
        <!-- Tier 1: Flame 🔥 (Regularity) -->
        @if (g.tier === 'flame' && g.regularStreak > 0) {
          <div class="flex flex-col items-center gap-1 p-4 rounded-2xl border-2 shadow-sm"
               [class.bg-orange-100]="theme.persona() === 'child'"
               [class.text-orange-600]="theme.persona() === 'child'"
               [class.border-orange-200]="theme.persona() === 'child'"
               [class.bg-blue-50]="theme.persona() === 'teen'"
               [class.text-blue-600]="theme.persona() === 'teen'"
               [class.border-blue-200]="theme.persona() === 'teen'">
            <div class="flex items-center gap-3 font-black text-xl">
              <span class="text-3xl animate-bounce">🔥</span>
              {{ copy.streakTitle() }} {{ g.regularStreak }}
            </div>
            <span class="text-[10px] uppercase font-bold opacity-60">{{ copy.streakPointsLabel() }} : {{ g.totalStreakPoints }}</span>
          </div>
        } @else if (g.hasPreviousRecords && g.hasMissedYesterday && g.tier === 'flame') {
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

        <!-- Tier 2: Star ⭐ (Perfect Weeks) -->
        @if (g.tier === 'star') {
          <div class="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border-2 shadow-sm bg-white"
               [class.border-amber-200]="theme.persona() === 'child'"
               [class.border-blue-200]="theme.persona() === 'teen'">
            <div class="flex items-center gap-3 font-black text-2xl"
                 [class.text-amber-600]="theme.persona() === 'child'"
                 [class.text-blue-600]="theme.persona() === 'teen'">
              <span class="text-4xl animate-pulse">⭐</span>
              {{ g.starsCount }} {{ g.starsCount > 1 ? 'Semaines' : 'Semaine' }}
            </div>
            <span class="text-[10px] uppercase font-bold text-slate-400">{{ copy.perfectPointsLabel() }} : {{ g.perfectPoints }}</span>
            @if (g.daysToNextStar > 0) {
              <span class="text-[9px] uppercase tracking-widest font-black text-slate-300">Prochaine dans {{ g.daysToNextStar }} {{ g.daysToNextStar > 1 ? 'jours' : 'jour' }}</span>
            }
          </div>
        }

        <!-- Tier 3: Trophy 🏆 (Elite) -->
        @if (g.tier === 'trophy') {
          <div class="flex items-center justify-center gap-4 p-5 rounded-3xl font-black text-2xl border-4 shadow-xl bg-gradient-to-r from-amber-50 to-white text-amber-600 border-amber-200 animate-in zoom-in duration-500">
            <span class="text-5xl drop-shadow-lg">🏆</span>
            Maître de l'Excellence
          </div>
        }
      </div>

      @if (g.showCongratulation) {
        <div class="text-center mb-6 animate-fade-in">
          <span class="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold tracking-tight shadow-sm">
            ✨ {{ g.perfectStreak >= 14 ? 'Perfection absolue !' : 'Super suivi !' }} {{ copy.successMessage() }} ✨
          </span>
        </div>
      }
    }
  `
})
export class GamificationSummaryComponent {
  theme = inject(ThemeService);
  copy = inject(CopywritingService);
  state = input<GamificationState | null>(null);
}
