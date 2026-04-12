import { Component, input, output, inject, computed } from '@angular/core';
import { LucideAngularModule, PencilLine, Activity, Trophy, Settings } from 'lucide-angular';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';

export type MobileTab = 'home' | 'supervision' | 'gaming' | 'preferences';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [LucideAngularModule, NgClass],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-[var(--color-border)] safe-padding-bottom z-40">
      <div class="flex justify-around items-center h-16">
        
        @for (tab of orderedTabs(); track tab.id) {
          <button (click)="tab.disabled ? null : selectTab(tab.id)" 
                  class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
                  [ngClass]="[
                    activeTab() === tab.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]',
                    tab.disabled ? 'opacity-30 grayscale' : ''
                  ]">
            <lucide-icon [img]="tab.icon" [size]="24" [strokeWidth]="activeTab() === tab.id ? 2.5 : 2"></lucide-icon>
            <span class="text-[10px] font-bold">{{ tab.label }}</span>
          </button>
        }

        <button 
          (click)="selectTab('preferences')"
          class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all rounded-full hover:bg-slate-50"
          [class.opacity-100]="activeTab() === 'preferences'"
          [class.opacity-50]="activeTab() !== 'preferences'"
          [class.text-[var(--color-primary)]]="activeTab() === 'preferences'">
          <div class="relative flex items-center justify-center p-1.5 transition-transform"
               [class.bg-[var(--color-primary)]]="activeTab() === 'preferences'"
               [class.text-white]="activeTab() === 'preferences'"
               [class.rounded-xl]="activeTab() === 'preferences'"
               [class.scale-110]="activeTab() === 'preferences'">
            <lucide-icon [img]="Settings" [size]="24" [strokeWidth]="activeTab() === 'preferences' ? 2.5 : 2"></lucide-icon>
          </div>
          <span class="text-[10px] font-bold tracking-wide">Paramètres</span>
        </button>

      </div>
    </nav>
  `
})
export class BottomNavComponent {
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
    const isPatientOnly = !hasOtherProfiles && perm === 'owner';

    const tabs = [
      { id: 'home' as MobileTab, label: 'Saisie', icon: PencilLine, disabled: isReader },
      { id: 'supervision' as MobileTab, label: 'Supervision', icon: Activity, disabled: false },
      { id: 'gaming' as MobileTab, label: 'Challenge', icon: Trophy, disabled: false }
    ];

    if (isPatientOnly) {
      return [tabs[0], tabs[2], tabs[1]];
    }

    return tabs;
  });

  selectTab(tab: MobileTab) {
    this.onTabChange.emit(tab);
  }
}
