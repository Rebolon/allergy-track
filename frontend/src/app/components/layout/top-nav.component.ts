import { Component, inject, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, PencilLine, Activity, Trophy, Settings } from 'lucide-angular';
import { MobileTab } from './bottom-nav.component';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [NgClass, LucideAngularModule, RouterLink, RouterLinkActive],
  template: `
    <div class="hidden md:block max-w-5xl mx-auto px-4 mb-8 sticky top-[72px] z-40">
      <nav class="flex justify-between items-center bg-white/50 backdrop-blur-md p-2 rounded-b-3xl border-x border-b border-white shadow-sm w-full gap-2 mt-[-1px]">
        
        @for (tab of orderedTabs(); track tab.id) {
          <a [routerLink]="tab.disabled ? null : tab.route" 
                  routerLinkActive="bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                  [routerLinkActiveOptions]="{exact: true}"
                  #rla="routerLinkActive"
                  [title]="tab.disabled ? 'Lecture seule' : ''"
                  class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2 cursor-pointer"
                  [ngClass]="[
                    !rla.isActive ? 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100' : '',
                    tab.disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''
                  ]">
            <lucide-icon [img]="tab.icon" [size]="20" [strokeWidth]="2.5"></lucide-icon>
            {{ tab.label }}
          </a>
        }
        
        <div class="w-px h-8 bg-slate-200 self-center mx-2 shrink-0"></div>
        
        <a routerLink="/settings" 
           routerLinkActive="bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
           #rlaPrefs="routerLinkActive"
           class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2 cursor-pointer"
           [ngClass]="!rlaPrefs.isActive ? 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100' : ''">
          <lucide-icon [img]="Settings" [size]="20" [strokeWidth]="2.5"></lucide-icon>
          Paramètres
        </a>
        
      </nav>
    </div>
  `
})
export class TopNavComponent {
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
