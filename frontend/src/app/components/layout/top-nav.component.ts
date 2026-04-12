import { Component, input, output, inject, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, PencilLine, Activity, Trophy, Settings } from 'lucide-angular';
import { MobileTab } from './bottom-nav.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [NgClass, LucideAngularModule],
  template: `
    <div class="hidden md:block max-w-5xl mx-auto px-4 mb-8 sticky top-[72px] z-40">
      <nav class="flex justify-between items-center bg-white/50 backdrop-blur-md p-2 rounded-b-3xl border-x border-b border-white shadow-sm w-full gap-2 mt-[-1px]">
        
        @for (tab of orderedTabs(); track tab.id) {
          <button (click)="tab.disabled ? null : selectTab(tab.id)" 
                  [title]="tab.disabled ? 'Lecture seule' : ''"
                  class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
                  [ngClass]="[
                    activeTab() === tab.id ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100',
                    tab.disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''
                  ]">
            <lucide-icon [img]="tab.icon" [size]="20" [strokeWidth]="2.5"></lucide-icon>
            {{ tab.label }}
          </button>
        }
        
        <div class="w-px h-8 bg-slate-200 self-center mx-2 shrink-0"></div>
        
        <button (click)="selectTab('preferences')" class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
                [ngClass]="activeTab() === 'preferences' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
          <lucide-icon [img]="Settings" [size]="20" [strokeWidth]="2.5"></lucide-icon>
          Paramètres
        </button>
        
      </nav>
    </div>
  `
})
export class TopNavComponent {
  private auth = inject(AuthService);
  activeTab = input<MobileTab>('home');
  onTabChange = output<MobileTab>();

  readonly PencilLine = PencilLine;
  readonly Activity = Activity;
  readonly Trophy = Trophy;
  readonly Settings = Settings;

  orderedTabs = computed(() => {
    const perm = this.auth.activePermission();
    const isReader = perm === 'reader';
    const hasOtherProfiles = (this.auth.currentUser()?.profiles?.length || 0) > 1;
    const isPatientOnly = !hasOtherProfiles && perm === 'owner'; // Simple heuristic

    const tabs = [
      { id: 'home' as MobileTab, label: 'Saisie', icon: PencilLine, disabled: isReader },
      { id: 'supervision' as MobileTab, label: 'Supervision', icon: Activity, disabled: false },
      { id: 'gaming' as MobileTab, label: 'Challenge', icon: Trophy, disabled: false }
    ];

    if (isPatientOnly) {
      // Reorder: Saisie, Gaming, Supervision
      return [tabs[0], tabs[2], tabs[1]];
    }

    return tabs;
  });

  selectTab(tab: MobileTab) {
    this.onTabChange.emit(tab);
  }
}
