import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { LucideAngularModule, ShieldCheck, ArrowRight, Mail, Lock } from 'lucide-angular';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-700"
         [class.opacity-0]="isfadingOut()"
         [class.pointer-events-none]="isfadingOut()">
      
      <!-- Background elements for premium feel -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        <div class="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div class="relative flex flex-col items-center gap-6 max-w-md w-full px-8 text-center scrollbar-hide overflow-y-auto max-h-[90vh]">
        
        <!-- Logo Animation -->
        <div class="relative mt-8">
          <div class="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2rem] shadow-2xl flex items-center justify-center animate-bounce-slow">
            <span class="text-5xl">🍎</span>
          </div>
          <div class="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-emerald-600 border border-slate-100">
            <lucide-icon [img]="ShieldCheck" [size]="20" [strokeWidth]="2.5"></lucide-icon>
          </div>
        </div>

        <div class="space-y-1">
          <h1 class="text-3xl font-black tracking-tight text-slate-800">
             Allergy <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 font-black">Track</span>
          </h1>
          <p class="text-slate-500 font-bold">Sécurisation de tes données...</p>
        </div>

        <!-- Conditional Content -->
        @if (auth.isReady()) {
          @if (!auth.isAuthenticated()) {
            
            <div class="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              <!-- SSO Button -->
              <button (click)="loginSSO()" 
                      class="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 group">
                Se connecter avec Synology
                <lucide-icon [img]="ArrowRight" [size]="20" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
              </button>

              <div class="relative flex items-center gap-4 py-2">
                <div class="flex-1 h-px bg-slate-100"></div>
                <span class="text-[10px] font-black uppercase text-slate-300 tracking-widest">OU</span>
                <div class="flex-1 h-px bg-slate-100"></div>
              </div>

              <!-- Classic Login Form -->
              <form (ngSubmit)="loginPassword()" class="flex flex-col gap-3">
                <div class="relative">
                  <lucide-icon [img]="Mail" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                  <input type="email" name="email" [(ngModel)]="email" placeholder="Email" required
                         class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700">
                </div>
                <div class="relative">
                  <lucide-icon [img]="Lock" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                  <input type="password" name="password" [(ngModel)]="password" placeholder="Mot de passe" required
                         class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700">
                </div>
                <button type="submit" [disabled]="loading()"
                        class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
                  {{ loading() ? 'Connexion...' : 'Se connecter' }}
                </button>
              </form>

              @if (error()) {
                <p class="text-rose-500 text-xs font-bold animate-shake">{{ error() }}</p>
              }

              <p class="mt-2 text-[10px] text-slate-400 font-medium">Authentification sécurisée allergie-track.fr</p>
            </div>
          } @else {
            <div class="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border-2 border-emerald-100 font-black animate-pulse">
               <span>✓</span> Session active
            </div>
          }
        } @else {
          <div class="flex items-center gap-2 mt-4">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          </div>
        }

      </div>

      <!-- Footer -->
      <div class="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p class="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">Allergy Track Intelligence</p>
      </div>

    </div>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce-slow {
      animation: bounce-slow 4s ease-in-out infinite;
    }
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
  `]
})
export class SplashScreenComponent implements OnInit {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  
  isfadingOut = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  email = '';
  password = '';

  ngOnInit() {
    setTimeout(() => {
      this.checkAndClose();
    }, 2000);
  }

  checkAndClose() {
    if (this.auth.isReady() && this.auth.isAuthenticated()) {
      this.isfadingOut.set(true);
    } else if (this.auth.isReady() && !this.auth.isAuthenticated()) {
      // Remain on login
    } else {
      setTimeout(() => this.checkAndClose(), 500);
    }
  }

  async loginSSO() {
    try {
      this.error.set(null);
      await this.auth.login();
    } catch (e) {
      this.error.set('Échec de la connexion SSO Synology');
    }
  }

  async loginPassword() {
    if (!this.email || !this.password) return;
    
    try {
      this.loading.set(true);
      this.error.set(null);
      await this.auth.loginWithPassword(this.email, this.password);
      this.checkAndClose();
    } catch (e) {
      this.error.set('Email ou mot de passe incorrect');
    } finally {
      this.loading.set(false);
    }
  }

  readonly ShieldCheck = ShieldCheck;
  readonly ArrowRight = ArrowRight;
  readonly Mail = Mail;
  readonly Lock = Lock;
}
