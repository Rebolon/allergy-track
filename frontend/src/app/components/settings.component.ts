import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeService, AppTheme } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { ProtocolService, ProtocolItem, SymptomItem, SYMPTOM_PRESETS } from '../services/protocol.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { LucideAngularModule, UserPlus, Share2, FolderHeart, ShieldCheck, Eye, Trash2, Plus } from 'lucide-angular';

import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, LucideAngularModule],
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
                        class="p-4 border-4 rounded-2xl flex items-center gap-4 transition-all"
                        [class.border-emerald-500]="currentTheme() === 'colorful'"
                        [class.bg-emerald-50]="currentTheme() === 'colorful'"
                        [class.border-slate-100]="currentTheme() !== 'colorful'">
                  <span class="text-3xl">🌈</span>
                  <div class="text-left">
                    <p class="font-black text-slate-800">Coloré</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Ludique & Fun</p>
                  </div>
                </button>
                <button (click)="setTheme('classic')" 
                        class="p-4 border-4 rounded-2xl flex items-center gap-4 transition-all"
                        [class.border-emerald-500]="currentTheme() === 'classic'"
                        [class.bg-emerald-50]="currentTheme() === 'classic'"
                        [class.border-slate-100]="currentTheme() !== 'classic'">
                  <span class="text-3xl">🕶️</span>
                  <div class="text-left">
                    <p class="font-black text-slate-800">Classique</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Épuré & Sobre</p>
                  </div>
                </button>
              </div>
            </section>

            <!-- Protocol -->
            <section>
              <span class="block text-sm font-black mb-4 uppercase text-slate-400 tracking-widest">Configuration Protocole</span>
              <form [formGroup]="protocolForm" (ngSubmit)="saveProtocols()">
                <div class="mb-6 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex flex-col gap-2">
                  <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Date de début</label>
                  <input type="date" formControlName="startDate" class="p-3 bg-white rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                </div>

                <div formArrayName="items" class="space-y-3 mb-4">
                  @for (item of protocolsArray.controls; track item.get('id')?.value; let i = $index) {
                    <div [formGroupName]="i" class="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 bg-white">
                      <input type="text" formControlName="allergen" class="flex-1 w-full p-2 font-bold bg-slate-50 rounded-lg outline-none" placeholder="Allergène">
                      <div class="flex gap-2 w-full sm:w-auto">
                        <input type="number" formControlName="dose" class="w-20 p-2 font-bold bg-slate-50 rounded-lg outline-none text-center" placeholder="Dose">
                        <input type="number" formControlName="frequencyDays" class="w-20 p-2 font-bold bg-slate-50 rounded-lg outline-none text-center" title="Tous les X jours">
                        <button type="button" (click)="removeProtocol(i)" class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                          <lucide-icon [img]="Trash2" [size]="20"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <button type="button" (click)="addProtocol()" class="w-full py-3 mb-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
                  <lucide-icon [img]="Plus" [size]="18"></lucide-icon> Ajouter une ligne
                </button>

                <button type="submit" [disabled]="protocolForm.invalid || !protocolForm.dirty" 
                        class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
                  Enregistrer les modifications
                </button>
              </form>
            </section>
          </div>
        </div>

        <!-- Sharing Section (Only Owner) -->
        @if (auth.activePermission() === 'owner') {
          <div [ngClass]="theme.cardClass()" class="border-violet-100 !bg-violet-50/20">
            <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-violet-800">
              <span class="text-3xl">🤝</span> Partage du dossier
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button (click)="generateInvite('editor')" 
                      class="p-6 bg-white border-4 border-violet-100 rounded-3xl text-left hover:border-violet-400 transition-all group">
                <div class="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <lucide-icon [img]="ShieldCheck" [size]="24"></lucide-icon>
                </div>
                <p class="font-black text-violet-900 leading-tight">Co-Superviseur</p>
                <p class="text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-1">Édition & Saisie</p>
              </button>

              <button (click)="generateInvite('reader')" 
                      class="p-6 bg-white border-4 border-slate-100 rounded-3xl text-left hover:border-violet-400 transition-all group">
                <div class="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <lucide-icon [img]="Eye" [size]="24"></lucide-icon>
                </div>
                <p class="font-black text-slate-900 leading-tight">Observateur</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lecture seule</p>
              </button>
            </div>

            @if (inviteCode()) {
              <div class="p-6 bg-violet-600 text-white rounded-3xl text-center space-y-2 animate-in zoom-in duration-300">
                <p class="text-xs font-black uppercase tracking-widest opacity-70">Code d'invitation ({{ inviteRoleLabel() }})</p>
                <p class="text-4xl font-black tracking-[0.2em]">{{ inviteCode() }}</p>
                <p class="text-[10px] font-bold opacity-60">Ce code est valable 24h.</p>
              </div>
            }
          </div>
        }
      }

      <!-- Global Management -->
      <div [ngClass]="theme.cardClass()">
        <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
          <span class="text-3xl">📂</span> Mes Dossiers
        </h2>

        <div class="space-y-4 mb-8">
          @for (profile of auth.currentUser()?.profiles; track profile.id) {
            <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl"
                     [style.borderColor]="getProfileColor(profile.id)"
                     [style.backgroundColor]="getProfileColor(profile.id) + '15'">
                  {{ getDisplayAvatar(profile) }}
                </div>
                <div>
                  <p class="font-black text-slate-800 leading-none">{{ profile.name }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">{{ getProfilePermissionLabel(profile.id) }}</p>
                </div>
              </div>
              @if (auth.activeProfile()?.id !== profile.id) {
<button 
                      (click)="auth.switchProfile(profile.id)"
                      class="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all">
                Basculer
              </button>
}
              @if (auth.activeProfile()?.id === profile.id) {
<span 
                    class="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest">Actif</span>
}
            </div>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <!-- Add Child -->
          <div class="space-y-3">
            <h3 class="font-black text-slate-800 flex items-center gap-2">
              <lucide-icon [img]="FolderHeart" [size]="18" class="text-rose-500"></lucide-icon>
              Nouveau dossier patient
            </h3>
            <div class="flex gap-2">
              <input #newName type="text" placeholder="Prénom de l'enfant" class="flex-1 p-3 bg-slate-50 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-rose-500">
              <button (click)="createChild(newName.value); newName.value = ''" class="px-4 py-3 bg-rose-500 text-white rounded-xl font-black text-sm shadow-md hover:bg-rose-600 transition-all">Créer</button>
            </div>
          </div>

          <!-- Join -->
          <div class="space-y-3">
            <h3 class="font-black text-slate-800 flex items-center gap-2">
              <lucide-icon [img]="UserPlus" [size]="18" class="text-violet-500"></lucide-icon>
              Rejoindre un dossier
            </h3>
            <div class="flex gap-2">
              <input #joinCode type="text" placeholder="Code invitation" class="flex-1 p-3 bg-slate-50 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-violet-500 uppercase tracking-widest">
              <button (click)="acceptInvite(joinCode.value); joinCode.value = ''" class="px-4 py-3 bg-violet-500 text-white rounded-xl font-black text-sm shadow-md hover:bg-violet-600 transition-all">Rejoindre</button>
            </div>
          </div>
        </div>
      </div>

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
  inviteCode = signal<string | null>(null);
  inviteRole = signal<string>('');

  protocolForm: FormGroup = this.fb.group({
    startDate: ['', Validators.required],
    items: this.fb.array([])
  });

  canEditActive = computed(() => {
    const perm = this.auth.activePermission();
    return perm === 'owner' || perm === 'editor';
  });

  inviteRoleLabel = computed(() => {
    return this.inviteRole() === 'editor' ? 'Co-Superviseur' : 'Observateur';
  });

  ngOnInit() {
    this.currentTheme.set(this.theme.currentTheme());
    this.initProtocolForm();
  }

  async logout() {
    await this.auth.logout();
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
    const startDate = this.protocolService.protocolStartDate() || '';

    this.protocolForm.patchValue({ startDate });
    currentProtocols.forEach(p => {
      this.protocolsArray.push(this.fb.group({
        id: [p.id],
        allergen: [p.allergen, Validators.required],
        dose: [p.dose, [Validators.required, Validators.min(0)]],
        frequencyDays: [p.frequencyDays, [Validators.required, Validators.min(1)]],
        createdAt: [p.createdAt]
      }));
    });
  }

  addProtocol() {
    this.protocolsArray.push(this.fb.group({
      id: [crypto.randomUUID()],
      allergen: ['', Validators.required],
      dose: [1.5, [Validators.required, Validators.min(0)]],
      frequencyDays: [1, [Validators.required, Validators.min(1)]],
      createdAt: [new Date().toISOString().split('T')[0]]
    }));
    this.protocolForm.markAsDirty();
  }

  removeProtocol(index: number) {
    this.protocolsArray.removeAt(index);
    this.protocolForm.markAsDirty();
  }

  saveProtocols() {
    if (this.protocolForm.valid) {
      this.protocolService.updateProtocols(this.protocolForm.value.items);
      this.protocolService.updateStartDate(this.protocolForm.value.startDate);
      this.protocolForm.markAsPristine();
    }
  }

  async generateInvite(role: 'editor' | 'reader') {
    const active = this.auth.activeProfile();
    if (!active) return;
    this.inviteRole.set(role);
    const code = await this.profileService.generateInvitationToken(active.id);
    this.inviteCode.set(code);
  }

  async createChild(name: string) {
    if (!name) return;
    await this.profileService.createLocalChild(name);
  }

  async acceptInvite(code: string) {
    if (!code) return;
    await this.profileService.acceptInvitation(code);
  }

  getDisplayAvatar(profile: any): string {
    const skinToneModifiers: Record<string, string> = { 'light': '\u{1F3FB}', 'dark': '\u{1F3FF}' };
    const base = profile?.avatar || '👶';
    const modifier = profile?.avatarSkinTone && skinToneModifiers[profile.avatarSkinTone] ? skinToneModifiers[profile.avatarSkinTone] : '';
    const noSkinTone = ['🏠', '🐱', '🐶', '🐷', '🐮', '👽'];
    return base + (!noSkinTone.includes(base) ? modifier : '');
  }

  getProfileColor(profileId: string): string {
    return this.auth.currentUser()?.profileAccesses.find(a => a.profileId === profileId)?.colorCode || '#6366f1';
  }

  getProfilePermissionLabel(profileId: string): string {
    const perm = this.auth.currentUser()?.profileAccesses.find(a => a.profileId === profileId)?.permission;
    switch (perm) {
      case 'owner': return 'Propriétaire';
      case 'editor': return 'Éditeur';
      case 'reader': return 'Observateur';
      default: return '';
    }
  }

  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Share2 = Share2;
  readonly Eye = Eye;
  readonly ShieldCheck = ShieldCheck;
  readonly FolderHeart = FolderHeart;
  readonly UserPlus = UserPlus;
}
