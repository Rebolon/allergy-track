import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, Home, Activity, Trophy, Settings } from 'lucide-angular';
import { MobileTab } from './bottom-nav.component';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [NgClass, LucideAngularModule],
  template: `
    <nav class="hidden md:flex justify-center items-center gap-2 mb-8 bg-white/50 backdrop-blur-md p-2 rounded-2xl mx-auto w-max border border-white shadow-sm mt-4">
      
      <button (click)="selectTab('home')" class="px-5 py-2.5 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
              [ngClass]="activeTab() === 'home' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
        <lucide-icon [img]="Home" [size]="20" [strokeWidth]="2.5"></lucide-icon>
        Accueil
      </button>

      <button (click)="selectTab('supervision')" class="px-5 py-2.5 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
              [ngClass]="activeTab() === 'supervision' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
        <lucide-icon [img]="Activity" [size]="20" [strokeWidth]="2.5"></lucide-icon>
        Supervision
      </button>

      <button (click)="selectTab('gaming')" class="px-5 py-2.5 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
              [ngClass]="activeTab() === 'gaming' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
        <lucide-icon [img]="Trophy" [size]="20" [strokeWidth]="2.5"></lucide-icon>
        Challenge
      </button>
      
      <div class="w-px h-8 bg-slate-200 self-center mx-2"></div>
      
      <button (click)="selectTab('preferences')" class="px-5 py-2.5 rounded-xl font-bold transition-all border-2 flex items-center gap-2"
              [ngClass]="activeTab() === 'preferences' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] border-transparent hover:bg-slate-100'">
        <lucide-icon [img]="Settings" [size]="20" [strokeWidth]="2.5"></lucide-icon>
        Préférences
      </button>
      
    </nav>
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
