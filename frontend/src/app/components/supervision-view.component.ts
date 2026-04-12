import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { AuditLogComponent } from './audit-log.component';

@Component({
  selector: 'app-supervision-view',
  standalone: true,
  imports: [DashboardComponent, AuditLogComponent],
  template: `
    <div class="flex flex-col gap-6">
      <app-dashboard />
      <app-audit-log />
    </div>
  `
})
export class SupervisionViewComponent {}
