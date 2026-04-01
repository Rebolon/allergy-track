import { Component, signal, computed, output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../services/theme.service';

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
              class="flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
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
export class AgendaComponent {
  theme = inject(ThemeService);
  currentDate = signal(new Date());
  selectedDate = signal(new Date().toISOString().split('T')[0]);

  dateSelected = output<string>();

  weekDays = computed(() => {
    const curr = new Date(this.currentDate());
    const dayOfWeek = curr.getDay() || 7; // Make Sunday 7 instead of 0
    const first = curr.getDate() - dayOfWeek + 1; // Monday

    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }).substring(0, 3),
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr
      });
    }
    return days;
  });

  currentMonthYear = computed(() => {
    return this.currentDate().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  previousWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() - 7);
    this.currentDate.set(d);
  }

  nextWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + 7);
    this.currentDate.set(d);
  }

  selectDate(date: string) {
    this.selectedDate.set(date);
    this.dateSelected.emit(date);
  }
}
