import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SharingService } from '../../services/sharing.service';
import { ThemeService } from '../../services/theme.service';
import { LucideAngularModule, ShieldCheck, Eye } from 'lucide-angular';
import { PermissionLevel } from '../../models/allergy-track.model';

@Component({
  selector: 'app-sharing-settings',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div [class]="theme.cardClass()" class="border-violet-100 !bg-violet-50/20">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-violet-800">
        <span class="text-3xl">🤝</span> Partage du dossier
      </h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button (click)="generateInvite('editor')" 
                class="p-6 bg-white border-2 border-violet-100 rounded-3xl text-left hover:border-violet-400 transition-all group shadow-sm">
          <div class="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <lucide-icon [img]="ShieldCheck" [size]="24"></lucide-icon>
          </div>
          <p class="font-black text-violet-900 leading-tight">Co-Superviseur</p>
          <p class="text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-1">Édition & Saisie</p>
        </button>

        <button (click)="generateInvite('reader')" 
                class="p-6 bg-white border-2 border-slate-100 rounded-3xl text-left hover:border-violet-400 transition-all group shadow-sm">
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
  `
})
export class SharingSettingsComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private sharingService = inject(SharingService);

  inviteCode = signal<string | null>(null);
  inviteRole = signal<string>('');

  inviteRoleLabel() {
    return this.inviteRole() === 'editor' ? 'Co-Superviseur' : 'Observateur';
  }

  generateInvite(role: 'editor' | 'reader') {
    const active = this.auth.activeProfile();
    if (!active) return;
    this.inviteRole.set(role);
    this.sharingService.generateInviteCode(active.id, role as PermissionLevel).subscribe(code => {
      this.inviteCode.set(code);
    });
  }

  readonly ShieldCheck = ShieldCheck;
  readonly Eye = Eye;
}
