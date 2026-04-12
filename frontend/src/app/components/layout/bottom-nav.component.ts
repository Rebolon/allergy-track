import { Component, inject, computed } from '@angular/core';
import { LucideAngularModule, PencilLine, Activity, Trophy, Settings } from 'lucide-angular';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type MobileTab = 'home' | 'supervision' | 'gaming' | 'preferences';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [LucideAngularModule, NgClass, RouterLink, RouterLinkActive],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-[var(--color-border)] safe-padding-bottom z-40">
      <div class="flex justify-around items-center h-16">
        
        @for (tab of orderedTabs(); track tab.id) {
          <a [routerLink]="tab.disabled ? null : tab.route" 
                  routerLinkActive="text-[var(--color-primary)] active-tab"
                  [routerLinkActiveOptions]="{exact: tab.route === '/home' || tab.route === '/'}"
                  #rla="routerLinkActive"
                  class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer relative"
                  [ngClass]="[
                    !rla.isActive ? 'text-[var(--color-text-muted)]' : '',
                    tab.disabled ? 'opacity-30 grayscale pointer-events-none' : ''
                  ]">
            <lucide-icon [img]="tab.icon" [size]="24" [strokeWidth]="rla.isActive ? 2.5 : 2"></lucide-icon>
            <span class="text-[10px] font-bold">{{ tab.label }}</span>
            
            @if (rla.isActive) {
              <div class="absolute -top-[1px] left-1/4 right-1/4 h-0.5 bg-[var(--color-primary)] rounded-full"></div>
            }
          </a>
        }

      </div>
    </nav>
  `
})
export class BottomNavComponent {
  private auth = inject(AuthService);

  readonly PencilLine = PencilLine;
  readonly Activity = Activity;
  readonly Trophy = Trophy;
  readonly Settings = Settings;

  orderedTabs = computed(() => {
    const perm = this.auth.activePermission();
    const isReader = perm === 'reader';
    const hasOtherProfiles = (this.auth.currentUser()?.profiles?.length || 0) > 1;
    const isPatientOnly = !hasOtherProfiles && perm === 'owner';

    const tabs = [
      { id: 'home' as MobileTab, label: 'Saisie', icon: PencilLine, disabled: isReader, route: '/home' },
      { id: 'supervision' as MobileTab, label: 'Supervision', icon: Activity, disabled: false, route: '/supervision' },
      { id: 'gaming' as MobileTab, label: 'Challenge', icon: Trophy, disabled: false, route: '/gaming' },
      { id: 'preferences' as MobileTab, label: 'Paramètres', icon: Settings, disabled: false, route: '/settings' }
    ];

    if (isPatientOnly) {
      // Reorder for patient: Saisie, Challenge, Supervision, Paramètres
      return [tabs[0], tabs[2], tabs[1], tabs[3]];
    }

    return tabs;
  });
}
