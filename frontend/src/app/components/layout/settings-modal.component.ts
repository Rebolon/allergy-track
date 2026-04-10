import { Component, inject, signal, OnInit, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeService, AppTheme } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-slate-800 animate-in zoom-in duration-300">
        <h2 class="text-2xl font-black mb-6">Affichage</h2>
        <div class="mb-8 space-y-4">
          <span class="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">Sélecteur de Thème</span>
          
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
            <input type="radio" name="theme" value="colorful" [checked]="currentTheme() === 'colorful'" (change)="currentTheme.set('colorful')" class="w-6 h-6 accent-violet-600 focus:ring-violet-500 border-gray-300">
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
            <input type="radio" name="theme" value="classic" [checked]="currentTheme() === 'classic'" (change)="currentTheme.set('classic')" class="w-6 h-6 accent-blue-600 focus:ring-blue-500 border-gray-300">
          </label>
        </div>
        <div class="flex justify-end gap-3 mt-4">
          <button (click)="theme.toggleTheme()" class="hidden"></button> <!-- Just an easy access if needed later -->
          <button (click)="close()" class="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold transition-colors">Fermer</button>
          <button (click)="save()" class="px-6 py-3 rounded-xl text-white font-bold transition-colors shadow-lg" [ngClass]="theme.primaryButton()">Enregistrer</button>
        </div>
      </div>
    </div>
  `
})
export class SettingsModalComponent implements OnInit {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  
  initialTheme = input<'colorful' | 'classic'>('colorful');
  onClose = output<void>();
  onSave = output<'colorful' | 'classic'>();

  currentTheme = signal<'colorful' | 'classic'>('colorful');

  ngOnInit() {
    this.currentTheme.set(this.initialTheme());
  }

  close() {
    this.onClose.emit();
  }

  save() {
    this.theme.setTheme(this.currentTheme());
    this.onSave.emit(this.currentTheme());
  }
}

