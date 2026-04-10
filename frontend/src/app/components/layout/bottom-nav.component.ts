import { Component, input, output } from '@angular/core';
import { LucideAngularModule, Home, Activity, Trophy, Settings } from 'lucide-angular';
import { NgClass } from '@angular/common';

export type MobileTab = 'home' | 'supervision' | 'gaming' | 'preferences';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [LucideAngularModule, NgClass],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-[var(--color-border)] safe-padding-bottom z-40">
      <div class="flex justify-around items-center h-16">
        
        <button (click)="selectTab('home')" class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
                [ngClass]="activeTab() === 'home' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'">
          <lucide-icon [img]="Home" [size]="24" [strokeWidth]="activeTab() === 'home' ? 2.5 : 2"></lucide-icon>
          <span class="text-[10px] font-bold">Accueil</span>
        </button>

        <button (click)="selectTab('supervision')" class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
                [ngClass]="activeTab() === 'supervision' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'">
          <lucide-icon [img]="Activity" [size]="24" [strokeWidth]="activeTab() === 'supervision' ? 2.5 : 2"></lucide-icon>
          <span class="text-[10px] font-bold">Supervision</span>
        </button>

        <button (click)="selectTab('gaming')" class="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
                [ngClass]="activeTab() === 'gaming' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'">
          <lucide-icon [img]="Trophy" [size]="24" [strokeWidth]="activeTab() === 'gaming' ? 2.5 : 2"></lucide-icon>
          <span class="text-[10px] font-bold">Challenge</span>
        </button>

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
      <span class="text-[10px] font-bold tracking-wide">Préférences</span>
    </button>

      </div>
    </nav>
  `
})
export class BottomNavComponent {
  activeTab = input<MobileTab>('home');
  onTabChange = output<MobileTab>();

  readonly Home = Home;
  readonly Activity = Activity;
  readonly Trophy = Trophy;
  readonly Settings = Settings;

  selectTab(tab: MobileTab) {
    this.onTabChange.emit(tab);
  }
}
