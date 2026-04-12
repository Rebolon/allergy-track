import { Component, inject, signal } from '@angular/core';
import { AgendaComponent } from './agenda.component';
import { DailyEntryComponent } from './daily-entry.component';
import { GamificationSummaryComponent } from './layout/gamification-summary.component';
import { GamificationService } from '../services/gamification.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [AgendaComponent, DailyEntryComponent, GamificationSummaryComponent],
  template: `
    <div class="flex flex-col gap-6">
      <app-gamification-summary [state]="gState()" />
      <app-agenda (dateSelected)="onDateSelected($event)" />
      <app-daily-entry [date]="selectedDate()" />
    </div>
  `
})
export class HomeViewComponent {
  private gamification = inject(GamificationService);
  gState = toSignal(this.gamification.getGamificationState().pipe(startWith(null)), { initialValue: null });
  
  selectedDate = signal(this.getTodayStr());

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
