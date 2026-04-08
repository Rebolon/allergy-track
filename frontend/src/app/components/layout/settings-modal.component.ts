import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
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
          
          <!-- Option: Flashy -->
          <label class="relative flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer hover:bg-violet-50 transition-all font-bold"
                 [class.border-violet-500]="currentTheme() === 'flashy'"
                 [class.bg-violet-50]="currentTheme() === 'flashy'"
                 [class.border-slate-100]="currentTheme() !== 'flashy'">
            <div class="flex items-center gap-4">
              <div class="text-4xl">🌈</div>
              <div class="flex flex-col">
                <span class="text-slate-800 text-lg">Flashy</span>
                <span class="text-xs font-bold text-slate-400">Couleurs vives et amusantes</span>
              </div>
            </div>
            <input type="radio" name="theme" value="flashy" [checked]="currentTheme() === 'flashy'" (change)="currentTheme.set('flashy')" class="w-6 h-6 accent-violet-600 focus:ring-violet-500 border-gray-300">
          </label>

          <!-- Option: Classic -->
          <label class="relative flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all font-bold"
                 [class.border-blue-500]="currentTheme() === 'classic'"
                 [class.bg-blue-50]="currentTheme() === 'classic'"
                 [class.border-slate-100]="currentTheme() !== 'classic'">
            <div class="flex items-center gap-4">
              <div class="text-4xl">🕶️</div>
              <div class="flex flex-col">
                <span class="text-slate-800 text-lg">Classique</span>
                <span class="text-xs font-bold text-slate-400">Design sombre et épuré</span>
              </div>
            </div>
            <input type="radio" name="theme" value="classic" [checked]="currentTheme() === 'classic'" (change)="currentTheme.set('classic')" class="w-6 h-6 accent-blue-600 focus:ring-blue-500 border-gray-300">
          </label>
        </div>
        <div class="flex justify-end gap-3 mt-4">
          <button (click)="onClose.emit()" class="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold transition-colors">Fermer</button>
          <button (click)="save()" class="px-6 py-3 rounded-xl text-white font-bold transition-colors shadow-lg" [ngClass]="theme.primaryButton()">Enregistrer</button>
        </div>
      </div>
    </div>
  `
})
export class SettingsModalComponent implements OnInit {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  
  initialTheme = input<'flashy' | 'classic'>('flashy');
  onClose = output<void>();
  onSave = output<'flashy' | 'classic'>();

  currentTheme = signal<'flashy' | 'classic'>('flashy');

  ngOnInit() {
    this.currentTheme.set(this.initialTheme());
  }

  save() {
    this.onSave.emit(this.currentTheme());
  }
}
