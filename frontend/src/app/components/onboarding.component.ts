import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { LucideAngularModule, Heart, Users, ArrowRight, Sparkles } from 'lucide-angular';
import { calculateAge } from '../utils/date.utils';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
      
      <div class="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        
        <!-- Step 1: BirthDate -->
        @if (step() === 1) {
          <div class="space-y-6">
            <div class="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <lucide-icon [img]="Sparkles" [size]="40"></lucide-icon>
            </div>
            <h1 class="text-3xl font-black text-slate-800">Bienvenue !</h1>
            <p class="text-slate-500 font-bold text-lg">Pour commencer l'aventure, quelle est ta date de naissance ?</p>
            
            <div class="pt-4">
              <input type="date" [(ngModel)]="birthDate" 
                     class="w-full p-4 text-center text-xl font-black bg-slate-50 border-4 border-transparent focus:border-amber-400 rounded-2xl outline-none transition-all">
            </div>

            <button (click)="nextStep()" [disabled]="!birthDate"
                    class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              Continuer
              <lucide-icon [img]="ArrowRight" [size]="24"></lucide-icon>
            </button>
          </div>
        }

        <!-- Step 2: Role Selection -->
        @if (step() === 2) {
          <div class="space-y-6">
            <h1 class="text-3xl font-black text-slate-800">Comment vas-tu utiliser l'app ?</h1>
            
            <div class="grid grid-cols-1 gap-4">
              <button (click)="finish(true)" 
                      class="p-6 border-4 border-emerald-100 bg-emerald-50/30 rounded-3xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <lucide-icon [img]="Heart" [size]="24"></lucide-icon>
                  </div>
                  <span class="text-xl font-black text-emerald-800">C'est pour moi</span>
                </div>
                <p class="text-emerald-600/70 font-bold leading-tight">Je vais suivre mon propre protocole de réintroduction.</p>
              </button>

              <button (click)="finish(false)" 
                      class="p-6 border-4 border-violet-100 bg-violet-50/30 rounded-3xl hover:border-violet-400 hover:bg-violet-50 transition-all text-left group">
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

        @if (loading()) {
          <div class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
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

  step = signal(1);
  loading = signal(false);
  birthDate = '';

  nextStep() {
    this.step.set(2);
  }

  async finish(isPatient: boolean) {
    this.loading.set(true);
    try {
      if (isPatient) {
        // Create owner profile
        const userName = this.auth.currentUser()?.name || 'Moi';
        await this.profileService.addProfile({
          name: userName,
          birthDate: this.birthDate,
          themePreference: 'colorful',
          isLocal: false
        });
      }
      // If only supervisor, we just reload session which will find no profiles but onboarding is done
      // Actually we need a way to mark onboarding as done if no profile created.
      // For now, let's assume if they choose "close", we might need to create a dummy or just refresh
      this.auth.checkSession();
    } catch (e) {
      console.error('Onboarding failed', e);
    } finally {
      this.loading.set(false);
    }
  }

  readonly Sparkles = Sparkles;
  readonly Heart = Heart;
  readonly Users = Users;
  readonly ArrowRight = ArrowRight;
}
