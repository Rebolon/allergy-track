import { Component, inject, signal, OnInit, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { LucideAngularModule, ShieldCheck, ArrowRight, Mail, Lock } from 'lucide-angular';
import { LayoutFooterComponent } from './layout/footer.component';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, LayoutFooterComponent],
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-white via-emerald-50/50 to-blue-50/50 transition-opacity duration-700"
         [class.opacity-0]="isfadingOut()"
         [class.pointer-events-none]="isfadingOut()">
      
      <!-- Background elements for child-friendly feel -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        <div class="absolute top-[10%] -left-[5%] w-64 h-64 bg-emerald-100 rounded-full blur-3xl animate-float-slow"></div>
        <div class="absolute bottom-[10%] -right-[5%] w-80 h-80 bg-blue-100 rounded-full blur-3xl animate-float-medium"></div>
        <div class="absolute top-[40%] left-[20%] w-32 h-32 bg-amber-50 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div class="relative flex flex-col items-center gap-6 max-w-md w-full px-8 text-center scrollbar-hide overflow-y-auto max-h-[95vh]">
        
        <!-- App Icon -->
        <div class="relative mt-4">
          <div class="absolute -inset-4 bg-white/40 blur-2xl rounded-full"></div>
          <img src="icons/icon-192x192.png" alt="Allergy Track Logo" 
               class="w-28 h-28 relative drop-shadow-2xl rounded-[2.5rem] animate-bounce-slow border-4 border-white bg-white">
        </div>

        <div class="space-y-1">
          <h1 class="text-3xl font-black tracking-tight text-slate-800">
             Allergy <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 font-black">Track</span>
          </h1>
          <p class="text-slate-500 font-bold">{{ auth.isAuthenticated() ? 'Sécurisation de tes données...' : 'Bienvenue' }}</p>
        </div>

        <!-- Conditional Content -->
        @if (auth.isReady()) {
          @if (!auth.isAuthenticated()) {
            
            <div class="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4 mb-8">
              
              <!-- SSO Button -->
              <button (click)="loginSSO()" 
                      class="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 group">
                Se connecter avec Synology
                <lucide-icon [img]="ArrowRight" [size]="20" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
              </button>

              <div class="relative flex items-center gap-4 py-2">
                <div class="flex-1 h-px bg-slate-200"></div>
                <span class="text-[10px] font-black uppercase text-slate-400 tracking-widest">OU</span>
                <div class="flex-1 h-px bg-slate-200"></div>
              </div>

              <!-- Classic Login Form -->
              <form (ngSubmit)="loginPassword()" class="flex flex-col gap-3">
                <div class="relative">
                  <lucide-icon [img]="Mail" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                  <input type="email" name="email" [(ngModel)]="email" placeholder="Email" required
                         class="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-100 focus:border-emerald-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm">
                </div>
                <div class="relative">
                  <lucide-icon [img]="Lock" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                  <input type="password" name="password" [(ngModel)]="password" placeholder="Mot de passe" required
                         class="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-100 focus:border-emerald-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm">
                </div>
                <button type="submit" [disabled]="loading()"
                        class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
                  {{ loading() ? 'Connexion...' : 'Se connecter' }}
                </button>
              </form>

              @if (error()) {
                <p class="text-rose-500 text-xs font-bold animate-shake">{{ error() }}</p>
              }

            </div>
          } @else {
            <div class="flex items-center gap-3 text-emerald-600 bg-emerald-50/80 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-emerald-100 font-black animate-pulse">
               <span>✓</span> Session active
            </div>
          }
        } @else {
          <div class="flex items-center gap-2 mt-4">
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
          </div>
        }

      </div>

      <!-- Footer -->
      <div class="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <app-layout-footer/>
      </div>

    </div>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0) rotate(-1deg); }
      50% { transform: translateY(-12px) rotate(1deg); }
    }
    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(15px, -20px); }
    }
    .animate-bounce-slow {
      animation: bounce-slow 4s ease-in-out infinite;
    }
    .animate-float-slow {
      animation: float 10s ease-in-out infinite;
    }
    .animate-float-medium {
      animation: float 7s ease-in-out infinite reverse;
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

  constructor() {
    // Reset splash screen when logging out
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this.isfadingOut.set(false);
      } else {
        // Only auto-close if it's already ready
        if (this.auth.isReady()) {
          this.isfadingOut.set(true);
        }
      }
    });
  }

  ngOnInit() {
    // Initial check with delay for nice animation
    setTimeout(() => {
      this.checkAndClose();
    }, 2000);
  }

  checkAndClose() {
    if (this.auth.isReady() && this.auth.isAuthenticated()) {
      this.isfadingOut.set(true);
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
