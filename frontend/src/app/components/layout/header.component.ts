import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LucideAngularModule, Bell } from 'lucide-angular';

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] border-b border-[var(--color-border)] sticky top-0 z-50 transition-colors duration-500 shadow-md">
      <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center safe-padding-top">
        <div class="flex items-center gap-3 relative z-50">
          <img src="/icons/favicon-96x96.png" alt="Logo" class="w-10 h-10 md:w-12 md:h-12 bg-white/20 p-1.5 rounded-2xl backdrop-blur-sm object-contain" />
          <h1 class="text-2xl md:text-3xl font-black flex flex-col tracking-tight">
            <span class="text-xl md:text-2xl text-white leading-none">Allergy Track</span>
          </h1>
        </div>
        
        <button class="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors bg-white/10 backdrop-blur-sm">
            <lucide-icon [img]="Bell" [size]="22" [strokeWidth]="2.5"></lucide-icon>
        </button>
      </div>
    </header>
  `
})
export class LayoutHeaderComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);

  readonly Bell = Bell;
}


