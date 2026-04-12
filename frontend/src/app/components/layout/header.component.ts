import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] border-b border-[var(--color-border)] sticky top-0 z-50 transition-colors duration-500 shadow-md">
      <div class="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center safe-padding-top">
        <div class="flex items-center gap-3">
          <img src="/icons/favicon-96x96.png" alt="Logo" class="w-10 h-10 bg-white/20 p-1.5 rounded-xl backdrop-blur-sm object-contain" />
          <h1 class="hidden md:block text-xl font-black tracking-tight">Allergy Track</h1>
        </div>
        
        <!-- Context Switcher -->
        @if (auth.currentUser()?.profiles?.length) {
          <div class="relative">
            <button (click)="isMenuOpen.set(!isMenuOpen())" 
                    class="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-[1.25rem] transition-all backdrop-blur-sm">
              <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shadow-sm"
                   [style.borderColor]="auth.activeColor()"
                   [style.backgroundColor]="auth.activeColor() + '20'">
                {{ getDisplayAvatar(auth.activeProfile()) }}
              </div>
              <span class="font-bold text-sm">{{ auth.activeProfile()?.name }}</span>
              <lucide-icon [img]="ChevronDown" [size]="16" [strokeWidth]="3" class="opacity-60" [class.rotate-180]="isMenuOpen()"></lucide-icon>
            </button>

            <!-- Dropdown -->
            @if (isMenuOpen()) {
              <div class="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <div class="px-4 py-3 mb-2 border-b border-slate-50">
                  <span class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Changer de dossier</span>
                </div>
                <div class="space-y-1">
                  @for (profile of auth.currentUser()?.profiles; track profile.id) {
                    <button (click)="switch(profile.id)"
                            class="w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-slate-50 group"
                            [class.bg-emerald-50]="auth.activeProfile()?.id === profile.id">
                      <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-transform group-hover:scale-110"
                           [style.borderColor]="getProfileColor(profile.id)"
                           [style.backgroundColor]="getProfileColor(profile.id) + '15'">
                        {{ getDisplayAvatar(profile) }}
                      </div>
                      <div class="flex-1 text-left">
                        <p class="font-black text-slate-800 text-sm leading-tight">{{ profile.name }}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">{{ getProfilePermissionLabel(profile.id) }}</p>
                      </div>
                      @if (auth.activeProfile()?.id === profile.id) {
                        <lucide-icon [img]="Check" [size]="18" [strokeWidth]="3" class="text-emerald-500"></lucide-icon>
                      }
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Overlay to close menu -->
        @if (isMenuOpen()) {
          <div (click)="isMenuOpen.set(false)" class="fixed inset-0 z-50"></div>
        }
      </div>
    </header>
  `
})
export class LayoutHeaderComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  isMenuOpen = signal(false);

  readonly ChevronDown = ChevronDown;
  readonly Check = Check;

  switch(id: string) {
    this.auth.switchProfile(id);
    this.isMenuOpen.set(false);
  }

  getDisplayAvatar(profile: any): string {
    const skinToneModifiers: Record<string, string> = {
      'light': '\u{1F3FB}',
      'dark': '\u{1F3FF}'
    };
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
    switch(perm) {
      case 'owner': return 'Propriétaire';
      case 'editor': return 'Éditeur';
      case 'reader': return 'Lecteur seul';
      default: return '';
    }
  }
}
