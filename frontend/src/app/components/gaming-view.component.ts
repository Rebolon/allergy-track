import { Component, inject } from '@angular/core';
import { GamificationSummaryComponent } from './layout/gamification-summary.component';
import { GamificationHistoryComponent } from './layout/gamification-history.component';
import { GamificationService } from '../services/gamification.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-gaming-view',
  standalone: true,
  imports: [GamificationSummaryComponent, GamificationHistoryComponent],
  template: `
    <div class="flex flex-col gap-6">
      <app-gamification-summary [state]="gState()" />
      <app-gamification-history [state]="gState()" />
    </div>
  `
})
export class GamingViewComponent {
  private gamification = inject(GamificationService);
  gState = toSignal(this.gamification.getGamificationState().pipe(startWith(null)), { initialValue: null });
}
