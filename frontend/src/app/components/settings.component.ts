import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeService, AppTheme } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { ProtocolService, ProtocolItem, SymptomItem, SYMPTOM_PRESETS } from '../services/protocol.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-6 p-6 mb-6 mt-6 md:mt-0">
      
      <!-- Theme Settings -->
      <div [ngClass]="theme.cardClass()">
        <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-[var(--color-primary)]">
          <span class="text-3xl">⚙️</span> Préférences d'Affichage
        </h2>
        <div class="space-y-4 max-w-xl">
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

      <!-- Protocol Settings -->
      <div [ngClass]="theme.cardClass()">
        <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-[var(--color-primary)]">
          <span class="text-3xl">📝</span> Configuration du Protocole ({{ auth.activeProfile()?.name }})
        </h2>
        <p class="text-[var(--color-text-muted)] text-sm mb-6 font-medium">Définissez la date de début ainsi que la liste des allergènes à prendre pour les défis gourmands. Si un allergène est à prendre tous les jours, mettez "1". Si tous les deux jours, mettez "2", etc.</p>

        <form [formGroup]="protocolForm" (ngSubmit)="saveProtocols()">
          
          <div class="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label class="block text-sm font-bold text-slate-700 mb-2">🎈 Date de début du protocole</label>
            <input type="date" formControlName="startDate" class="w-full max-w-xs p-3 font-bold bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
            <p class="text-xs text-slate-500 mt-2">La gamification et l'agenda se baseront sur cette date pour le calcul des historiques.</p>
          </div>

          <div formArrayName="items" class="space-y-3">
            @for (item of protocolsArray.controls; track item.get('id')?.value; let i = $index) {
              <div [formGroupName]="i" class="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                
                <div class="flex-1 w-full">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Nom / Allergène</label>
                  <input type="text" formControlName="allergen" class="w-full p-2 font-bold bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Ex: Cacahuète">
                </div>
                
                <div class="w-full sm:w-24">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Quantité</label>
                  <input type="number" step="0.5" min="0" formControlName="dose" class="w-full p-2 font-bold bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="1.5">
                </div>

                <div class="w-full sm:w-32">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Tous les (jours)</label>
                  <input type="number" min="1" formControlName="frequencyDays" class="w-full p-2 font-bold bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="1">
                </div>

                <div class="pt-4 sm:pt-5">
                  <button type="button" (click)="removeProtocol(i)" class="h-10 w-10 flex items-center justify-center rounded-lg bg-rose-100 text-rose-500 hover:bg-rose-200 transition-colors" title="Supprimer">
                    <span class="text-xl">🗑️</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="mt-4 flex gap-4">
            <button type="button" (click)="addProtocol()" class="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
              <span>➕</span> Ajouter une ligne
            </button>
            <div class="flex-1"></div>
            <button type="submit" [disabled]="protocolForm.invalid || !protocolForm.dirty" 
              class="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm">
              <span>💾</span> Enregistrer
            </button>
          </div>
          @if (saveSuccess()) {
            <div class="mt-4 p-3 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-2 text-sm max-w-fit">
              <span>✅</span> Protocole mis à jour avec succès !
            </div>
          }
        </form>
      </div>

      <!-- Symptoms Settings -->
      <div [ngClass]="theme.cardClass()">
        <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-[var(--color-primary)]">
          <span class="text-3xl">🤒</span> Symptômes Configurables
        </h2>
        <p class="text-[var(--color-text-muted)] text-sm mb-4 font-medium">Définissez la liste des symptômes proposés lors de la saisie quotidienne.</p>

        <!-- Preset buttons -->
        <div class="flex flex-wrap gap-3 mb-6">
          <span class="text-sm font-bold text-slate-500 self-center">Partir d'un modèle :</span>
          <button type="button" (click)="applyPreset('reintroduction')" class="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-violet-300 bg-violet-50 text-violet-700 font-bold text-sm hover:bg-violet-100 transition-colors">
            🍽️ Réintroduction alimentaire
          </button>
          <button type="button" (click)="applyPreset('desensibilisation')" class="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-blue-300 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors">
            💉 Désensibilisation
          </button>
        </div>

        <form [formGroup]="symptomForm" (ngSubmit)="saveSymptoms()">
          <div formArrayName="items" class="space-y-3">
            <!-- Fixed 'Rien' row -->
            <div class="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 opacity-60">
              <span class="text-2xl">😎</span>
              <span class="font-bold text-slate-600 flex-1">Rien</span>
              <span class="text-xs text-slate-400 italic">Non configurable — toujours présent</span>
            </div>

            @for (item of symptomsArray.controls; track item.get('id')?.value; let i = $index) {
              <div [formGroupName]="i" class="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div class="w-20">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Emoji</label>
                  <input type="text" formControlName="emoji" maxlength="4" class="w-full p-2 text-center text-xl bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="🤔">
                </div>
                <div class="flex-1 w-full">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Label du symptôme</label>
                  <input type="text" formControlName="label" class="w-full p-2 font-bold bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Ex: Démangeaisons">
                </div>
                <div class="pt-4 sm:pt-5">
                  <button type="button" (click)="removeSymptom(i)" class="h-10 w-10 flex items-center justify-center rounded-lg bg-rose-100 text-rose-500 hover:bg-rose-200 transition-colors" title="Supprimer">
                    <span class="text-xl">🗑️</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="mt-4 flex gap-4">
            <button type="button" (click)="addSymptom()" class="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
              <span>➕</span> Ajouter un symptôme
            </button>
            <div class="flex-1"></div>
            <button type="submit" [disabled]="symptomForm.invalid || !symptomForm.dirty"
              class="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm">
              <span>💾</span> Enregistrer
            </button>
          </div>
        </form>
      </div>

      <!-- Family Settings (Managed Profiles) -->
      @if (auth.currentUser().profiles.length > 0) {
        <div [ngClass]="theme.cardClass()">
          <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-[var(--color-primary)]">
            <span class="text-3xl">👨‍👩‍👧‍👦</span> Ma Famille & Dossiers
          </h2>
          <p class="text-[var(--color-text-muted)] text-sm mb-6 font-medium">Gérez ici les personnes que vous supervisez ou les dossiers partagés.</p>

          <div class="space-y-4 mb-8">
            @for (profile of auth.currentUser().profiles; track profile.id) {
              <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                       [class.bg-violet-100]="profile.role === 'Supervision'"
                       [class.bg-emerald-100]="profile.role === 'Allergique'">
                    {{ profile.role === 'Supervision' ? '🏠' : '👶' }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-800">{{ profile.name }}</span>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {{ profile.role === 'Supervision' ? 'Superviseur' : 'Allergique' }}
                      {{ profile.isLocal ? '• Dossier Local' : '• Compte Invité' }}
                    </span>
                  </div>
                </div>
                
                @if (profile.id !== auth.activeProfile()?.id) {
                  <button (click)="auth.switchProfile(profile.id)" 
                          class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    Basculer
                  </button>
                } @else {
                  <span class="px-4 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl text-sm font-black">Actif</span>
                }
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            <!-- Local Child -->
            <div>
              <h3 class="text-lg font-bold mb-2">Ajouter un dossier local</h3>
              <div class="flex gap-2 mb-2">
                <input #childName type="text" placeholder="Nom de l'enfant" 
                       class="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-bold text-sm">
                <button (click)="createChild(childName.value); childName.value = ''"
                        class="px-6 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-100 text-sm whitespace-nowrap">
                   Créer
                </button>
              </div>
              <p class="text-xs text-slate-400 font-medium">Idéal pour un enfant qui n'a pas encore de compte.</p>
            </div>

            <!-- Invitations -->
            <div>
              <h3 class="text-lg font-bold mb-2">Partager / Inviter</h3>
              <div class="flex flex-col gap-3">
                <button (click)="generateCode()" 
                        class="w-full px-4 py-3 bg-violet-100 text-violet-700 font-black rounded-xl hover:bg-violet-200 transition-colors text-sm flex items-center justify-center gap-2">
                  <span>🔗</span> Générer un code d'invitation
                </button>
                
                @if (inviteCode()) {
                  <div class="p-3 bg-violet-600 text-white rounded-xl text-center animate-pulse">
                    <span class="text-xs uppercase font-bold block opacity-70">Code à partager</span>
                    <span class="text-xl font-black tracking-widest">{{ inviteCode() }}</span>
                  </div>
                }

                <div class="flex gap-2 mt-2">
                  <input #inviteInput type="text" placeholder="Code d'invitation" 
                         class="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-bold text-sm uppercase tracking-widest">
                  <button (click)="acceptInvite(inviteInput.value); inviteInput.value = ''"
                          class="px-4 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-black transition-colors text-sm">
                     Rejoindre
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class SettingsComponent implements OnInit {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  protocolService = inject(ProtocolService);
  profileService = inject(ProfileService);
  fb = inject(FormBuilder);
  
  currentTheme = signal<AppTheme>('colorful');
  saveSuccess = signal<boolean>(false);
  saveSymptomSuccess = signal<boolean>(false);
  inviteCode = signal<string | null>(null);

  protocolForm: FormGroup = this.fb.group({
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    items: this.fb.array([])
  });

  symptomForm: FormGroup = this.fb.group({
    items: this.fb.array([])
  });

  ngOnInit() {
    this.currentTheme.set(this.theme.currentTheme());
    this.initProtocolForm();
    this.initSymptomForm();

    // Re-init forms when active profile changes to show correct configuration
    // (In case user switches profile directly in settings)
    this.auth.activeProfile(); // Track signal
  }

  async createChild(name: string) {
    if (!name) return;
    try {
      await this.profileService.createLocalChild(name);
    } catch (e) {
      console.error('Failed to create child profile', e);
    }
  }

  async generateCode() {
    const active = this.auth.activeProfile();
    if (!active) return;
    const code = await this.profileService.generateInvitationToken(active.id);
    this.inviteCode.set(code);
  }

  async acceptInvite(code: string) {
    if (!code) return;
    try {
      await this.profileService.acceptInvitation(code);
    } catch (e) {
      console.error('Failed to accept invitation', e);
    }
  }

  setTheme(newTheme: AppTheme) {
    this.currentTheme.set(newTheme);
    this.theme.setTheme(newTheme);
  }

  get protocolsArray() {
    return this.protocolForm.get('items') as FormArray;
  }

  initProtocolForm() {
    this.protocolsArray.clear();
    const currentProtocols = this.protocolService.protocols();
    const startDate = this.protocolService.protocolStartDate() || new Date().toISOString().split('T')[0];
    
    this.protocolForm.patchValue({ startDate });
    
    currentProtocols.forEach(p => {
      this.protocolsArray.push(this.createProtocolFormGroup(p));
    });
  }

  createProtocolFormGroup(item?: ProtocolItem): FormGroup {
    return this.fb.group({
      id: [item?.id || crypto.randomUUID()],
      allergen: [item?.allergen || '', Validators.required],
      dose: [item?.dose ?? 1.5, [Validators.required, Validators.min(0)]],
      frequencyDays: [item?.frequencyDays || 1, [Validators.required, Validators.min(1)]],
      createdAt: [item?.createdAt || new Date().toISOString().split('T')[0]]
    });
  }

  addProtocol() {
    this.protocolsArray.push(this.createProtocolFormGroup());
    this.protocolForm.markAsDirty();
  }

  removeProtocol(index: number) {
    this.protocolsArray.removeAt(index);
    this.protocolForm.markAsDirty();
  }

  saveProtocols() {
    if (this.protocolForm.valid) {
      const formValue = this.protocolForm.value;
      this.protocolService.updateProtocols(formValue.items);
      this.protocolService.updateStartDate(formValue.startDate);
      this.protocolForm.markAsPristine();
      
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }
  }

  get symptomsArray() {
    return this.symptomForm.get('items') as FormArray;
  }

  initSymptomForm() {
    this.symptomsArray.clear();
    const current = this.protocolService.symptoms();
    current.forEach(s => {
      this.symptomsArray.push(this.createSymptomFormGroup(s));
    });
  }

  createSymptomFormGroup(item?: SymptomItem): FormGroup {
    return this.fb.group({
      id: [item?.id || crypto.randomUUID()],
      label: [item?.label || '', Validators.required],
      emoji: [item?.emoji || '']
    });
  }

  addSymptom() {
    this.symptomsArray.push(this.createSymptomFormGroup());
    this.symptomForm.markAsDirty();
  }

  removeSymptom(index: number) {
    this.symptomsArray.removeAt(index);
    this.symptomForm.markAsDirty();
  }

  applyPreset(preset: 'reintroduction' | 'desensibilisation') {
    this.symptomsArray.clear();
    SYMPTOM_PRESETS[preset].forEach(s => {
      this.symptomsArray.push(this.createSymptomFormGroup({ ...s, id: crypto.randomUUID() }));
    });
    this.symptomForm.markAsDirty();
  }

  saveSymptoms() {
    if (this.symptomForm.valid) {
      this.protocolService.updateSymptoms(this.symptomForm.value.items);
      this.symptomForm.markAsPristine();
      this.saveSymptomSuccess.set(true);
      setTimeout(() => this.saveSymptomSuccess.set(false), 3000);
    }
  }
}
