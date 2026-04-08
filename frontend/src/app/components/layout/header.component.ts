import { Component, inject, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [MatIconModule, NgClass],
  template: `
    <header class="text-white shadow-lg sticky top-0 z-10 transition-colors duration-500" [ngClass]="theme.headerGradient()">
      <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight">
          <img src="/icons/favicon-96x96.png" alt="Logo" class="w-10 h-10 md:w-12 md:h-12 bg-white/20 p-1.5 rounded-2xl backdrop-blur-sm object-contain" />
          AllergyTrack
        </h1>
        
        <div class="flex items-center gap-2 bg-white/20 p-1.5 rounded-2xl backdrop-blur-sm">
          @for (user of auth.getUsers(); track user.id) {
            <button
                (click)="auth.switchSpecificUser(user.id)"
                class="px-4 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105"
                [class.bg-white]="auth.currentUser().id === user.id"
                [class.text-violet-600]="auth.currentUser().id === user.id && theme.persona() === 'child'"
                [class.text-indigo-600]="auth.currentUser().id === user.id && theme.persona() === 'teen'"
                [class.text-slate-800]="auth.currentUser().id === user.id && theme.persona() === 'adult'"
                [class.shadow-md]="auth.currentUser().id === user.id"
                [class.text-white]="auth.currentUser().id !== user.id"
                [class.hover:bg-white/20]="auth.currentUser().id !== user.id">
            {{ user.name }}
            </button>
          }
          <button (click)="onOpenSettings.emit()" class="p-2 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center justify-center">
              <mat-icon>settings</mat-icon>
          </button>
        </div>
      </div>
    </header>
  `
})
export class LayoutHeaderComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  onOpenSettings = output<void>();
}
