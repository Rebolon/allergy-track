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
                  routerLinkActive="text-[var(--color-primary)]"
                  [routerLinkActiveOptions]="{exact: true}"
                  #rla="routerLinkActive"
                  class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer"
                  [ngClass]="[
                    !rla.isActive ? 'text-[var(--color-text-muted)]' : '',
                    tab.disabled ? 'opacity-30 grayscale' : ''
                  ]">
            <lucide-icon [img]="tab.icon" [size]="24" [strokeWidth]="rla.isActive ? 2.5 : 2"></lucide-icon>
            <span class="text-[10px] font-bold">{{ tab.label }}</span>
          </a>
        }

        <a 
          routerLink="/settings"
          routerLinkActive="text-[var(--color-primary)]"
          #rlaPrefs="routerLinkActive"
          class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all rounded-full hover:bg-slate-50 cursor-pointer"
          [class.opacity-100]="rlaPrefs.isActive"
          [class.opacity-50]="!rlaPrefs.isActive">
          <div class="relative flex items-center justify-center p-1.5 transition-transform"
               [class.bg-[var(--color-primary)]]="rlaPrefs.isActive"
               [class.text-white]="rlaPrefs.isActive"
               [class.rounded-xl]="rlaPrefs.isActive"
               [class.scale-110]="rlaPrefs.isActive">
            <lucide-icon [img]="Settings" [size]="24" [strokeWidth]="rlaPrefs.isActive ? 2.5 : 2"></lucide-icon>
          </div>
          <span class="text-[10px] font-bold tracking-wide">Paramètres</span>
        </a>

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
      { id: 'gaming' as MobileTab, label: 'Challenge', icon: Trophy, disabled: false, route: '/gaming' }
    ];

    if (isPatientOnly) {
      return [tabs[0], tabs[2], tabs[1]];
    }

    return tabs;
  });
}
