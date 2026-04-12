import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { SharingService } from '../services/sharing.service';
import { ActiveDossierService } from '../services/active-dossier.service';
import { LucideAngularModule, Heart, Users, ArrowRight, Sparkles, UserPlus, FolderHeart, CheckCircle2, AlertCircle, Calendar, Zap, ShieldCheck } from 'lucide-angular';
import { ProtocolFormComponent } from './settings/protocol-form.component';
import { SymptomFormComponent } from './settings/symptom-form.component';
import { MedicsShieldFormComponent } from './settings/medics-shield-form.component';

type OnboardingStep = 'birthdate' | 'choice' | 'proche_choice' | 'proche_create' | 'proche_join' | 'protocol_type' | 'config_protocol' | 'config_symptoms' | 'config_shields' | 'success_me';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    ProtocolFormComponent, 
    SymptomFormComponent, 
    MedicsShieldFormComponent
  ],
  template: `
    <div class="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      
      <div class="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500 py-12">
        
        <!-- Step 1: User BirthDate -->
        @if (step() === 'birthdate') {
          <div class="space-y-6">
            <div class="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <lucide-icon [img]="Sparkles" [size]="40"></lucide-icon>
            </div>
            <h1 class="text-3xl font-black text-slate-800">Bienvenue !</h1>
            <p class="text-slate-500 font-bold text-lg">Pour commencer l'aventure, quelle est ta date de naissance ?</p>
            
            <div class="pt-4">
              <input type="date" [(ngModel)]="userBirthDate" 
                     class="w-full p-4 text-center text-xl font-black bg-slate-50 border-2 border-transparent focus:border-amber-400 rounded-2xl outline-none transition-all">
            </div>

            <button (click)="goToChoice()" [disabled]="!userBirthDate"
                    class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              Continuer
              <lucide-icon [img]="ArrowRight" [size]="24"></lucide-icon>
            </button>
          </div>
        }

        <!-- Step 2: Main Choice -->
        @if (step() === 'choice') {
          <div class="space-y-6">
            <h1 class="text-3xl font-black text-slate-800">Comment vas-tu utiliser l'app ?</h1>
            
            <div class="grid grid-cols-1 gap-4">
              <button (click)="chooseMe()" 
                      class="p-6 border-2 border-emerald-100 bg-emerald-50/30 rounded-3xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <lucide-icon [img]="Heart" [size]="24"></lucide-icon>
                  </div>
                  <span class="text-xl font-black text-emerald-800">C'est pour moi</span>
                </div>
                <p class="text-emerald-600/70 font-bold leading-tight">Je vais suivre mon propre protocole de réintroduction.</p>
              </button>

              <button (click)="goToProcheChoice()" 
                      class="p-6 border-2 border-violet-100 bg-violet-50/30 rounded-3xl hover:border-violet-400 hover:bg-violet-50 transition-all text-left group">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 bg-violet-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <lucide-icon [img]="Users" [size]="24"></lucide-icon>
                  </div>
                  <span class="text-xl font-black text-violet-800">C'est pour un proche</span>
                </div>
                <p class="text-violet-600/70 font-bold leading-tight">Je supervise le protocole d'un enfant ou d'un proche.</p>
              </button>
            </div>
          </div>
        }

        <!-- Branch Proche: Sub-Choice -->
        @if (step() === 'proche_choice') {
          <div class="space-y-6">
            <button (click)="step.set('choice')" class="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2 mb-4">
               ← Retour
            </button>
            <h1 class="text-3xl font-black text-slate-800 text-left leading-tight">D'accord. Comment souhaites-tu commencer ?</h1>
            
            <div class="grid grid-cols-1 gap-4">
              <button (click)="step.set('proche_create')" 
                      class="p-6 border-2 border-rose-100 bg-rose-50/30 rounded-3xl hover:border-rose-400 hover:bg-rose-50 transition-all text-left group">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <lucide-icon [img]="FolderHeart" [size]="24"></lucide-icon>
                  </div>
                  <span class="text-xl font-black text-rose-800">Créer un nouveau dossier</span>
                </div>
                <p class="text-rose-600/70 font-bold leading-tight">Ajouter un enfant ou un proche dont je vais gérer le suivi.</p>
              </button>

              <button (click)="step.set('proche_join')" 
                      class="p-6 border-2 border-blue-100 bg-blue-50/30 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <lucide-icon [img]="UserPlus" [size]="24"></lucide-icon>
                  </div>
                  <span class="text-xl font-black text-blue-800">Rejoindre un dossier</span>
                </div>
                <p class="text-blue-600/70 font-bold leading-tight">On m'a fourni un code pour consulter ou éditer un dossier.</p>
              </button>
            </div>
          </div>
        }

        <!-- Branch Proche: Create Child -->
        @if (step() === 'proche_create') {
          <div class="space-y-6 text-left">
            <button (click)="step.set('proche_choice')" class="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2 mb-4">
               ← Retour
            </button>
            <h1 class="text-3xl font-black text-slate-800">Nouveau dossier</h1>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prénom du proche</label>
                <input type="text" [(ngModel)]="procheName" placeholder="Ex: Léo"
                       class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-rose-400 rounded-2xl outline-none transition-all font-bold text-lg text-slate-700">
              </div>
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date de naissance</label>
                <input type="date" [(ngModel)]="procheBirthDate" 
                       class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-rose-400 rounded-2xl outline-none transition-all font-bold text-lg text-slate-700">
              </div>
            </div>

            <button (click)="createProche()" [disabled]="!procheName || !procheBirthDate || loading()"
                    class="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {{ loading() ? 'Création...' : 'Créer le dossier' }}
              <lucide-icon [img]="CheckCircle2" [size]="24"></lucide-icon>
            </button>
          </div>
        }

        <!-- Branch Proche: Join Dossier -->
        @if (step() === 'proche_join') {
          <div class="space-y-6 text-left">
            <button (click)="step.set('proche_choice')" class="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2 mb-4">
               ← Retour
            </button>
            <h1 class="text-3xl font-black text-slate-800">Rejoindre un dossier</h1>
            <p class="text-slate-500 font-bold">Saisis le code d'invitation qui t'a été communiqué.</p>
            
            <div class="pt-4">
              <input type="text" [(ngModel)]="inviteCode" placeholder="ABCDEF"
                     class="w-full p-6 text-center text-4xl font-black bg-slate-50 border-2 border-transparent focus:border-blue-400 rounded-2xl outline-none transition-all text-blue-600 tracking-[0.3em] uppercase">
            </div>

            <button (click)="joinDossier()" [disabled]="!inviteCode || loading()"
                    class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {{ loading() ? 'Vérification...' : 'Rejoindre' }}
              <lucide-icon [img]="ArrowRight" [size]="24"></lucide-icon>
            </button>
          </div>
        }

        <!-- STEP: Protocol Type Selection -->
        @if (step() === 'protocol_type') {
          <div class="space-y-6 text-left">
            <h1 class="text-3xl font-black text-slate-800">Quel protocole suis-tu ?</h1>
            <p class="text-slate-500 font-bold">Nous allons pré-configurer tes défis et tes symptômes.</p>
            
            <div class="grid grid-cols-1 gap-3">
              <button (click)="setProtocolType('reintroduction')" 
                      class="p-5 border-2 border-slate-100 rounded-3xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left flex items-center gap-4">
                <span class="text-3xl">🍽️</span>
                <div>
                  <p class="font-black text-slate-800">Réintroduction alimentaire</p>
                  <p class="text-xs font-bold text-slate-400 uppercase">Lait, Oeuf, Arachide...</p>
                </div>
              </button>

              <button (click)="setProtocolType('desensibilisation')" 
                      class="p-5 border-2 border-slate-100 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left flex items-center gap-4">
                <span class="text-3xl">💉</span>
                <div>
                  <p class="font-black text-slate-800">Désensibilisation</p>
                  <p class="text-xs font-bold text-slate-400 uppercase">Acariens, Pollens...</p>
                </div>
              </button>
            </div>
          </div>
        }

        <!-- STEP: Config Protocol -->
        @if (step() === 'config_protocol') {
          <div class="space-y-6">
            <div class="flex items-center gap-4 text-left">
              <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <lucide-icon [img]="Calendar" [size]="24"></lucide-icon>
              </div>
              <div>
                <h1 class="text-2xl font-black text-slate-800 leading-tight">Quand commences-tu et quels sont tes allergènes ?</h1>
              </div>
            </div>
            
            <app-protocol-form [onboardingMode]="true" (saved)="step.set('config_symptoms')" />
          </div>
        }

        <!-- STEP: Config Symptoms -->
        @if (step() === 'config_symptoms') {
          <div class="space-y-6">
            <div class="flex items-center gap-4 text-left">
              <div class="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center shrink-0">
                <lucide-icon [img]="Zap" [size]="24"></lucide-icon>
              </div>
              <div>
                <h1 class="text-2xl font-black text-slate-800 leading-tight">Quels symptômes souhaites-tu surveiller ?</h1>
              </div>
            </div>
            
            <app-symptom-form [onboardingMode]="true" (saved)="step.set('config_shields')" />
          </div>
        }

        <!-- STEP: Config Shields -->
        @if (step() === 'config_shields') {
          <div class="space-y-6">
            <div class="flex items-center gap-4 text-left">
              <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <lucide-icon [img]="ShieldCheck" [size]="24"></lucide-icon>
              </div>
              <div>
                <h1 class="text-2xl font-black text-slate-800 leading-tight">Quels médicaments as-tu à disposition ?</h1>
              </div>
            </div>
            
            <app-medics-shield-form [onboardingMode]="true" (saved)="step.set('success_me')" />
          </div>
        }

        <!-- Final Success Step -->
        @if (step() === 'success_me') {
          <div class="space-y-6">
            <div class="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-sm">
              <lucide-icon [img]="CheckCircle2" [size]="48"></lucide-icon>
            </div>
            <h1 class="text-3xl font-black text-slate-800">Prêt pour l'aventure !</h1>
            <p class="text-slate-500 font-bold text-lg">Ta configuration est terminée. Tu peux maintenant commencer à remplir ton journal quotidien.</p>
            
            <button (click)="finishOnboarding()"
                    class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
              C'est parti !
              <lucide-icon [img]="ArrowRight" [size]="24"></lucide-icon>
            </button>
          </div>
        }

        @if (error()) {
          <div class="p-4 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 font-bold animate-shake">
            <lucide-icon [img]="AlertCircle" [size]="20"></lucide-icon>
            <p class="text-sm">{{ error() }}</p>
          </div>
        }

        @if (loading()) {
          <div class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[120]">
            <div class="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

      </div>
    </div>
  `
})
export class OnboardingComponent {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private sharingService = inject(SharingService);
  private activeDossier = inject(ActiveDossierService);
  private router = inject(Router);

  step = signal<OnboardingStep>('birthdate');
  loading = signal(false);
  error = signal<string | null>(null);
  
  userBirthDate = '1990-01-01';
  procheName = '';
  procheBirthDate = '2015-01-01';
  inviteCode = '';

  goToChoice() {
    this.error.set(null);
    this.step.set('choice');
  }

  goToProcheChoice() {
    this.error.set(null);
    this.step.set('proche_choice');
  }

  async chooseMe() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const userName = this.auth.currentUser()?.name || 'Moi';
      await this.profileService.addProfile({
        name: userName,
        birthDate: this.userBirthDate,
        themePreference: 'colorful',
        isLocal: false
      });
      // After profile creation, ask for protocol type
      this.auth.checkSession();
      this.step.set('protocol_type');
    } catch (e) {
      console.error('Me creation failed', e);
      this.error.set("Impossible de créer ton profil. Réessaye !");
    } finally {
      this.loading.set(false);
    }
  }

  async createProche() {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.profileService.addProfile({
        name: this.procheName,
        birthDate: this.procheBirthDate,
        themePreference: 'colorful',
        isLocal: true
      });
      // After profile creation, ask for protocol type
      this.auth.checkSession();
      this.step.set('protocol_type');
    } catch (e) {
      console.error('Proche creation failed', e);
      this.error.set("Erreur lors de la création du dossier.");
    } finally {
      this.loading.set(false);
    }
  }

  setProtocolType(type: 'reintroduction' | 'desensibilisation') {
    this.activeDossier.applyProtocolTypePreset(type);
    this.activeDossier.updateStartDate(new Date().toISOString().split('T')[0]);
    this.step.set('config_protocol');
  }

  async joinDossier() {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.sharingService.joinDossier(this.inviteCode);
      this.auth.checkSession();
      this.router.navigate(['/home']);
    } catch (e) {
      console.error('Join failed', e);
      this.error.set("Code invalide ou dossier introuvable.");
    } finally {
      this.loading.set(false);
    }
  }

  finishOnboarding() {
    this.auth.checkSession();
    this.router.navigate(['/home']);
  }

  readonly Sparkles = Sparkles;
  readonly Heart = Heart;
  readonly Users = Users;
  readonly ArrowRight = ArrowRight;
  readonly UserPlus = UserPlus;
  readonly FolderHeart = FolderHeart;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly Calendar = Calendar;
  readonly Zap = Zap;
  readonly ShieldCheck = ShieldCheck;
}
