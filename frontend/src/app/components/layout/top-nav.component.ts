import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, Home, Activity, Trophy, Settings } from 'lucide-angular';
import { MobileTab } from './bottom-nav.component';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [NgClass, LucideAngularModule],
  template: `
    <div class="hidden md:block max-w-5xl mx-auto px-4 mb-8 sticky top-[72px] z-40">
      <nav class="flex justify-between items-center bg-white/50 backdrop-blur-md p-2 rounded-b-3xl border-x border-b border-white shadow-sm w-full gap-2 mt-[-1px]">
        
        <button (click)="selectTab('home')" class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
                [ngClass]="activeTab() === 'home' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
          <lucide-icon [img]="Home" [size]="20" [strokeWidth]="2.5"></lucide-icon>
          Accueil
        </button>

        <button (click)="selectTab('supervision')" class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
                [ngClass]="activeTab() === 'supervision' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
          <lucide-icon [img]="Activity" [size]="20" [strokeWidth]="2.5"></lucide-icon>
          Supervision
        </button>

        <button (click)="selectTab('gaming')" class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
                [ngClass]="activeTab() === 'gaming' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
          <lucide-icon [img]="Trophy" [size]="20" [strokeWidth]="2.5"></lucide-icon>
          Challenge
        </button>
        
        <div class="w-px h-8 bg-slate-200 self-center mx-2 shrink-0"></div>
        
        <button (click)="selectTab('preferences')" class="flex-1 justify-center py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
                [ngClass]="activeTab() === 'preferences' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
          <lucide-icon [img]="Settings" [size]="20" [strokeWidth]="2.5"></lucide-icon>
          Préférences
        </button>
        
      </nav>
    </div>
  `
})
export class TopNavComponent {
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
