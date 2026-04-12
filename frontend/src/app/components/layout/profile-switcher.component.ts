import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, User as UserIcon, Plus } from 'lucide-angular';

@Component({
  selector: 'app-profile-switcher',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (profiles().length > 1) {
      <div class="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide px-6 max-w-5xl mx-auto">
        @for (profile of profiles(); track profile.id) {
          <button (click)="auth.switchProfile(profile.id)"
                  class="flex items-center gap-2 px-4 py-2 rounded-[1.25rem] font-black transition-all border-2 whitespace-nowrap"
                  [class.bg-[var(--color-primary)]]="activeProfile()?.id === profile.id"
                  [class.text-white]="activeProfile()?.id === profile.id"
                  [class.border-[var(--color-primary)]]="activeProfile()?.id === profile.id"
                  [class.bg-white]="activeProfile()?.id !== profile.id"
                  [class.text-slate-500]="activeProfile()?.id !== profile.id"
                  [class.border-slate-100]="activeProfile()?.id !== profile.id"
                  [class.shadow-sm]="activeProfile()?.id === profile.id"
                  [class.hover:bg-slate-50]="activeProfile()?.id !== profile.id">
            
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                 [class.bg-white/20]="activeProfile()?.id === profile.id"
                 [class.bg-slate-100]="activeProfile()?.id !== profile.id">
              {{ getDisplayAvatar(profile) }}
            </div>
            {{ profile.name }}
          </button>
        }
        
        <!-- Add profile shortcut if parent -->
        @if (auth.activeProfile()?.role === 'Supervision') {
          <button class="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-emerald-300 hover:text-emerald-400 transition-colors">
            <lucide-icon [img]="Plus" [size]="18"></lucide-icon>
          </button>
        }
      </div>
    }
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class ProfileSwitcherComponent {
  auth = inject(AuthService);
  
  profiles = computed(() => this.auth.currentUser()?.profiles || []);
  activeProfile = this.auth.activeProfile;

  getDisplayAvatar(profile: any): string {
    const skinToneModifiers: Record<string, string> = {
      'light': '\u{1F3FB}',
      'dark': '\u{1F3FF}'
    };
    const base = profile.avatar || (profile.role === 'Supervision' ? '🏠' : profile.role === 'Mixte' ? '👤' : '👶');
    const modifier = profile.avatarSkinTone && skinToneModifiers[profile.avatarSkinTone] ? skinToneModifiers[profile.avatarSkinTone] : '';
    
    const noSkinTone = ['🏠', '🐱', '🐶', '🐷', '🐮', '👽'];
    return base + (!noSkinTone.includes(base) ? modifier : '');
  }

  readonly UserIcon = UserIcon;
  readonly Plus = Plus;
}
