import { Component, inject, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { ActiveDossierService } from '../services/active-dossier.service';
import { ProtocolFormComponent } from './settings/protocol-form.component';
import { SymptomFormComponent } from './settings/symptom-form.component';
import { MedicsShieldFormComponent } from './settings/medics-shield-form.component';
import { SharingSettingsComponent } from './settings/sharing-settings.component';
import { DossierManagementComponent } from './settings/dossier-management.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    NgClass,
    ProtocolFormComponent,
    SymptomFormComponent,
    MedicsShieldFormComponent,
    SharingSettingsComponent,
    DossierManagementComponent
  ],
  template: `
    <div class="flex flex-col gap-6 p-6 mb-6 mt-6 md:mt-0">
      
      <!-- Account & Logout -->
      <div [ngClass]="theme.cardClass()" class="!bg-rose-50/30 border-rose-100">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl shadow-sm">
              👤
            </div>
            <div>
              <h2 class="text-xl font-black text-rose-800">Mon Compte</h2>
              <p class="text-xs font-bold text-rose-400 uppercase tracking-wider">{{ auth.currentUser()?.email }}</p>
            </div>
          </div>
          <button (click)="logout()" 
                  class="w-full md:w-auto py-3 px-8 bg-white border-2 border-rose-200 text-rose-600 font-black rounded-2xl hover:bg-rose-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95">
            Déconnexion
          </button>
        </div>
      </div>

      <!-- Active Dossier Management (Only if Owner/Editor) -->
      @if (canEditActive()) {
        <div [ngClass]="theme.cardClass()">
          <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-[var(--color-primary)]">
            <span class="text-3xl text-emerald-500">⚙️</span> Dossier Actif : {{ auth.activeProfile()?.name }}
          </h2>

          <div class="space-y-8">
            <!-- Theme -->
            <section>
              <span class="block text-sm font-black mb-4 uppercase text-slate-400 tracking-widest">Thème du dossier</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button (click)="setTheme('colorful')" 
                        class="p-4 border-2 rounded-2xl flex items-center gap-4 transition-all"
                        [class.border-emerald-500]="activeDossier.currentTheme() === 'colorful'"
                        [class.bg-emerald-50]="activeDossier.currentTheme() === 'colorful'"
                        [class.border-slate-100]="activeDossier.currentTheme() !== 'colorful'">
                  <span class="text-3xl">🌈</span>
                  <div class="text-left">
                    <p class="font-black text-slate-800">Coloré</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Ludique & Fun</p>
                  </div>
                </button>
                <button (click)="setTheme('classic')" 
                        class="p-4 border-2 rounded-2xl flex items-center gap-4 transition-all"
                        [class.border-emerald-500]="activeDossier.currentTheme() === 'classic'"
                        [class.bg-emerald-50]="activeDossier.currentTheme() === 'classic'"
                        [class.border-slate-100]="activeDossier.currentTheme() !== 'classic'">
                  <span class="text-3xl">🕶️</span>
                  <div class="text-left">
                    <p class="font-black text-slate-800">Classique</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Épuré & Sobre</p>
                  </div>
                </button>
              </div>
            </section>

            <!-- Protocol Form -->
            <app-protocol-form (saved)="saveConfig()" />

            <!-- Symptom Form -->
            <app-symptom-form (saved)="saveConfig()" />

            <!-- Medics Shield Form -->
            <app-medics-shield-form (saved)="saveConfig()" />
          </div>
        </div>

        <!-- Sharing Section (Only Owner) -->
        @if (auth.activePermission() === 'owner') {
          <app-sharing-settings />
        }
      }

      <!-- Global Management -->
      <app-dossier-management />

    </div>
  `
})
export class SettingsComponent {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  activeDossier = inject(ActiveDossierService);

  canEditActive = computed(() => {
    const perm = this.auth.activePermission();
    return perm === 'owner' || perm === 'editor';
  });

  logout() {
    this.auth.logout().subscribe();
  }

  saveConfig() {
    this.activeDossier.saveCurrentConfig().subscribe();
  }

  setTheme(newTheme: any) {
    this.activeDossier.updateTheme(newTheme).subscribe();
  }
}
