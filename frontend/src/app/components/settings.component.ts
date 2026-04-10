import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeService, AppTheme } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass],
  template: `
    <div [ngClass]="theme.cardClass()" class="p-6 mb-6 mt-6 md:mt-0">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-[var(--color-primary)]">
        <span class="text-3xl">⚙️</span> Préférences d'Affichage
      </h2>
      <div class="mb-8 space-y-4 max-w-xl">
        <span class="block text-sm font-bold mb-3 uppercase tracking-wider text-[var(--color-text-muted)]">Sélecteur de Thème</span>
        
        <!-- Option: Colorful -->
        <label class="relative flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer hover:bg-violet-50 transition-all font-bold"
               [class.border-violet-500]="currentTheme() === 'colorful'"
               [class.bg-violet-50]="currentTheme() === 'colorful'"
               [class.border-slate-100]="currentTheme() !== 'colorful'">
          <div class="flex items-center gap-4">
            <div class="text-4xl">🌈</div>
            <div class="flex flex-col">
              <span class="text-slate-800 text-lg">Coloré</span>
              <span class="text-xs font-bold text-slate-400">Couleurs vives et amusantes</span>
            </div>
          </div>
          <input type="radio" name="theme" value="colorful" [checked]="currentTheme() === 'colorful'" (change)="setTheme('colorful')" class="w-6 h-6 accent-violet-600 focus:ring-violet-500 border-gray-300">
        </label>

        <!-- Option: Classic -->
        <label class="relative flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all font-bold"
               [class.border-blue-500]="currentTheme() === 'classic'"
               [class.bg-blue-50]="currentTheme() === 'classic'"
               [class.border-slate-100]="currentTheme() !== 'classic'">
          <div class="flex items-center gap-4">
            <div class="text-4xl">🕶️</div>
            <div class="flex flex-col">
              <span class="text-slate-800 text-lg">Classique</span>
              <span class="text-xs font-bold text-slate-400">Design sobre et épuré</span>
            </div>
          </div>
          <input type="radio" name="theme" value="classic" [checked]="currentTheme() === 'classic'" (change)="setTheme('classic')" class="w-6 h-6 accent-blue-600 focus:ring-blue-500 border-gray-300">
        </label>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  
  currentTheme = signal<AppTheme>('colorful');

  ngOnInit() {
    this.currentTheme.set(this.theme.currentTheme());
  }

  setTheme(newTheme: AppTheme) {
    this.currentTheme.set(newTheme);
    this.theme.setTheme(newTheme);
  }
}
