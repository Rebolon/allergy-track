import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { LucideAngularModule, ShieldCheck, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-700"
         [class.opacity-0]="isfadingOut()"
         [class.pointer-events-none]="isfadingOut()">
      
      <!-- Background elements for premium feel -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        <div class="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div class="relative flex flex-col items-center gap-8 max-w-md px-8 text-center">
        
        <!-- Logo Animation -->
        <div class="relative">
          <div class="w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2.5rem] shadow-2xl flex items-center justify-center animate-bounce-slow">
            <span class="text-6xl">🍎</span>
          </div>
          <div class="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-emerald-600 border border-slate-100">
            <lucide-icon [img]="ShieldCheck" [size]="24" [strokeWidth]="2.5"></lucide-icon>
          </div>
        </div>

        <div class="space-y-2">
          <h1 class="text-4xl font-black tracking-tight text-slate-800">
             Allergy <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 font-black">Track</span>
          </h1>
          <p class="text-slate-500 font-bold text-lg">Sécurisation de tes données...</p>
        </div>

        <!-- Conditional Content -->
        @if (auth.isReady()) {
          @if (!auth.isAuthenticated()) {
            <!-- Login Button -->
            <div class="w-full mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button (click)="login()" 
                      class="w-full py-5 px-8 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 group">
                Se connecter avec Synology
                <lucide-icon [img]="ArrowRight" [size]="24" class="group-hover:translate-x-2 transition-transform"></lucide-icon>
              </button>
              <p class="mt-6 text-sm text-slate-400 font-medium">Authentification via OpenID Connect sécurisé</p>
            </div>
          } @else {
            <!-- Success / Redirection -->
            <div class="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border-2 border-emerald-100 font-black animate-pulse">
               <span>✓</span> Session active
            </div>
          }
        } @else {
          <!-- Spinner -->
          <div class="flex items-center gap-2 mt-8">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          </div>
        }

      </div>

      <!-- Footer -->
      <div class="absolute bottom-10 left-0 right-0 text-center">
        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Allergy Track Intelligence</p>
      </div>

    </div>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    .animate-bounce-slow {
      animation: bounce-slow 4s ease-in-out infinite;
    }
  `]
})
export class SplashScreenComponent implements OnInit {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  
  isfadingOut = signal(false);

  ngOnInit() {
    // On attend un minimum de 2s AVANT de faire disparaître le splashscreen
    // Mais on ne disparaît que si on est authentifié
    setTimeout(() => {
      this.checkAndClose();
    }, 2000);
  }

  checkAndClose() {
    if (this.auth.isReady() && this.auth.isAuthenticated()) {
      this.isfadingOut.set(true);
    } else if (this.auth.isReady() && !this.auth.isAuthenticated()) {
      // On reste sur le splashscreen pour afficher le bouton Login
    } else {
      // Toujours pas prêt, on réessaie plus tard
      setTimeout(() => this.checkAndClose(), 500);
    }
  }

  async login() {
    try {
      await this.auth.login();
      // Le redirect OAuth2 va se produire ici
    } catch (e) {
      console.error('Login failed', e);
    }
  }

  readonly ShieldCheck = ShieldCheck;
  readonly ArrowRight = ArrowRight;
}
