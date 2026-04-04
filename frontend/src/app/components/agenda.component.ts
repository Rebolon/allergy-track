import { Component, signal, computed, output, inject, OnInit, DestroyRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../services/theme.service';
import { PocketbaseAdapterService } from '../services/persistence/pocketbase-adapter.service';
import { GamificationService } from '../services/gamification.service';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [MatIconModule, NgClass],
  template: `
    <div class="flex flex-col items-center p-5 mb-6" [ngClass]="theme.cardClass()">
      <div class="flex justify-between w-full items-center mb-6 px-2">
        <button (click)="previousWeek()" class="p-3 rounded-2xl transition-colors"
                [class.bg-violet-50]="theme.persona() === 'child'"
                [class.text-violet-600]="theme.persona() === 'child'"
                [class.hover:bg-violet-100]="theme.persona() === 'child'"
                [class.bg-slate-100]="theme.persona() !== 'child'"
                [class.text-slate-600]="theme.persona() !== 'child'"
                [class.hover:bg-slate-200]="theme.persona() !== 'child'">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <h2 class="text-xl font-black capitalize"
            [class.text-violet-900]="theme.persona() === 'child'"
            [class.text-slate-800]="theme.persona() !== 'child'">
          {{ currentMonthYear() }}
        </h2>
        <button (click)="nextWeek()" class="p-3 rounded-2xl transition-colors"
                [class.bg-violet-50]="theme.persona() === 'child'"
                [class.text-violet-600]="theme.persona() === 'child'"
                [class.hover:bg-violet-100]="theme.persona() === 'child'"
                [class.bg-slate-100]="theme.persona() !== 'child'"
                [class.text-slate-600]="theme.persona() !== 'child'"
                [class.hover:bg-slate-200]="theme.persona() !== 'child'">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-2 w-full">
        @for (day of weekDays(); track day.date) {
          <div
              (click)="selectDate(day.date)"
              (keydown.enter)="selectDate(day.date)"
              tabindex="0"
              class="flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 relative"
              [class.bg-gradient-to-b]="day.date === selectedDate() && theme.persona() === 'child'"
              [class.from-violet-500]="day.date === selectedDate() && theme.persona() === 'child'"
              [class.to-fuchsia-500]="day.date === selectedDate() && theme.persona() === 'child'"
              [class.bg-blue-600]="day.date === selectedDate() && theme.persona() === 'teen'"
              [class.bg-slate-800]="day.date === selectedDate() && theme.persona() === 'adult'"
              [class.text-white]="day.date === selectedDate()"
              [class.shadow-lg]="day.date === selectedDate()"
              [class.shadow-violet-200]="day.date === selectedDate() && theme.persona() === 'child'"
              [class.shadow-blue-200]="day.date === selectedDate() && theme.persona() === 'teen'"
              [class.shadow-slate-200]="day.date === selectedDate() && theme.persona() === 'adult'"
              [class.hover:bg-violet-50]="day.date !== selectedDate() && theme.persona() === 'child'"
              [class.hover:bg-slate-50]="day.date !== selectedDate() && theme.persona() !== 'child'"
              [class.bg-violet-100]="day.isToday && day.date !== selectedDate() && theme.persona() === 'child'"
              [class.bg-blue-50]="day.isToday && day.date !== selectedDate() && theme.persona() === 'teen'"
              [class.bg-slate-100]="day.isToday && day.date !== selectedDate() && theme.persona() === 'adult'"
          >
            @if (day.isMissed) {
              <mat-icon class="absolute top-1 right-1 text-rose-500" style="font-size: 14px; width: 14px; height: 14px;">error_outline</mat-icon>
            }
            @if (day.isWarningToday) {
              <mat-icon class="absolute top-1 right-1 text-amber-500 animate-pulse-slow" style="font-size: 16px; width: 16px; height: 16px;">warning</mat-icon>
            }

            <span class="text-xs font-bold mb-1 uppercase tracking-wider"
                  [class.text-violet-100]="day.date === selectedDate() && theme.persona() === 'child'"
                  [class.text-blue-100]="day.date === selectedDate() && theme.persona() === 'teen'"
                  [class.text-slate-300]="day.date === selectedDate() && theme.persona() === 'adult'"
                  [class.text-violet-400]="day.date !== selectedDate() && theme.persona() === 'child'"
                  [class.text-slate-500]="day.date !== selectedDate() && theme.persona() !== 'child'">
              {{ day.dayName }}
            </span>
            <span class="text-xl font-black"
                  [class.text-violet-600]="day.isToday && day.date !== selectedDate() && theme.persona() === 'child'"
                  [class.text-blue-600]="day.isToday && day.date !== selectedDate() && theme.persona() === 'teen'"
                  [class.text-slate-800]="day.isToday && day.date !== selectedDate() && theme.persona() === 'adult'">
              {{ day.dayNumber }}
            </span>
          </div>
        }
      </div>
    </div>
  `
})
export class AgendaComponent implements OnInit {
  theme = inject(ThemeService);
  persistence = inject(PocketbaseAdapterService);
  gamification = inject(GamificationService);
  private destroyRef = inject(DestroyRef);

  currentDate = signal(new Date());
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  firstEntryDate = signal<string | null>(null);
  daysWithEntries = signal<Set<string>>(new Set());

  dateSelected = output<string>();

  ngOnInit() {
    this.persistence.getFirstEntryDate().pipe(take(1)).subscribe(date => {
      this.firstEntryDate.set(date);
    });

    // Refresh week logs whenever gamification tells us to refresh
    this.gamification.getGamificationState().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadWeekLogs();
    });
  }

  loadWeekLogs() {
    const days = this.calcWeekDays(this.currentDate());
    const start = days[0].date;
    const end = days[6].date;
    this.persistence.getDailyLogs(start, end).subscribe(logs => {
      const dates = new Set(logs.map(l => l.date));
      this.daysWithEntries.set(dates);
    });
  }

  private calcWeekDays(baseDate: Date) {
    const curr = new Date(baseDate);
    const dayOfWeek = curr.getDay() || 7;
    const first = curr.getDate() - dayOfWeek + 1;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }).substring(0, 3),
        dayNumber: d.getDate()
      });
    }
    return days;
  }

  weekDays = computed(() => {
    const days = this.calcWeekDays(this.currentDate());
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isAfter20h = today.getHours() >= 20;

    const firstDate = this.firstEntryDate();
    const entries = this.daysWithEntries();

    return days.map(d => {
      const hasEntry = entries.has(d.date);
      const isToday = d.date === todayStr;
      
      let isMissed = false;
      let isWarningToday = false;

      if (!hasEntry) {
        if (d.date < todayStr && firstDate && d.date > firstDate) {
          isMissed = true;
        } else if (isToday && isAfter20h) {
          isWarningToday = true;
        }
      }

      return {
        ...d,
        isToday,
        isMissed,
        isWarningToday
      };
    });
  });

  currentMonthYear = computed(() => {
    return this.currentDate().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  previousWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() - 7);
    this.currentDate.set(d);
    this.loadWeekLogs();
  }

  nextWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + 7);
    this.currentDate.set(d);
    this.loadWeekLogs();
  }

  selectDate(date: string) {
    this.selectedDate.set(date);
    this.dateSelected.emit(date);
  }
}
