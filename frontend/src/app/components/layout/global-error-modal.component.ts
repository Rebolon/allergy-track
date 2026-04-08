import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-global-error-modal',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6 shadow-rose-500/20 transform animate-in zoom-in duration-300">
        <div class="text-6xl mb-4 animate-bounce">🔌</div>
        <h2 class="text-2xl font-black text-rose-600">Oups il y a un problème!</h2>
        <p class="text-slate-600 font-bold text-lg leading-relaxed">{{ message() }}</p>
        <button (click)="reload()" class="mt-8 px-6 py-4 w-full rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3">
          <mat-icon>refresh</mat-icon>
          Réessayer
        </button>
      </div>
    </div>
  `
})
export class GlobalErrorModalComponent {
  message = input.required<string>();
  
  reload() {
    window.location.reload();
  }
}
