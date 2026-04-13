import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { SharingService } from '../../services/sharing.service';
import { ThemeService } from '../../services/theme.service';
import { LucideAngularModule, FolderHeart, UserPlus, User } from 'lucide-angular';

@Component({
  selector: 'app-dossier-management',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div [class]="theme.cardClass()">
      <h2 class="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
        <span class="text-3xl">📂</span> Mes Dossiers
      </h2>

      <div class="space-y-4 mb-8">
        @for (profile of auth.currentUser()?.profiles; track profile.id) {
          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                   [style.borderColor]="getProfileColor(profile.id)"
                   [style.backgroundColor]="getProfileColor(profile.id) + '15'">
                <lucide-icon [img]="User" [size]="20" [strokeWidth]="3" [style.color]="getProfileColor(profile.id)"></lucide-icon>
              </div>
              <div>
                <p class="font-black text-slate-800 leading-none">{{ profile.name }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">{{ getProfilePermissionLabel(profile.id) }}</p>
              </div>
            </div>
            
            @if (auth.activeProfile()?.id !== profile.id) {
              <button (click)="auth.switchProfile(profile.id)"
                      class="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all shadow-sm">
                Basculer
              </button>
            } @else {
              <span class="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-200">Actif</span>
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
            <input #newName type="text" placeholder="Prénom de l'enfant" 
                   class="flex-1 p-3 bg-slate-50 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-rose-500">
            <button (click)="createChild(newName.value); newName.value = ''" 
                    class="px-4 py-3 bg-rose-500 text-white rounded-xl font-black text-sm shadow-md hover:bg-rose-600 transition-all">Créer</button>
          </div>
        </div>

        <!-- Join -->
        <div class="space-y-3">
          <h3 class="font-black text-slate-800 flex items-center gap-2">
            <lucide-icon [img]="UserPlus" [size]="18" class="text-violet-500"></lucide-icon>
            Rejoindre un dossier
          </h3>
          <div class="flex gap-2">
            <input #joinCode type="text" placeholder="Code invitation" 
                   class="flex-1 p-3 bg-slate-50 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-violet-500 uppercase tracking-widest">
            <button (click)="acceptInvite(joinCode.value); joinCode.value = ''" 
                    class="px-4 py-3 bg-violet-500 text-white rounded-xl font-black text-sm shadow-md hover:bg-violet-600 transition-all">Rejoindre</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DossierManagementComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private profileService = inject(ProfileService);
  private sharingService = inject(SharingService);

  readonly FolderHeart = FolderHeart;
  readonly UserPlus = UserPlus;
  readonly User = User;

  getProfileColor(profileId: string): string {
    return this.auth.currentUser()?.profileAccesses.find(a => a.profileId === profileId)?.colorCode || '#6366f1';
  }

  getProfilePermissionLabel(profileId: string): string {
    const perm = this.auth.currentUser()?.profileAccesses.find(a => a.profileId === profileId)?.permission;
    switch(perm) {
      case 'owner': return 'Propriétaire';
      case 'editor': return 'Éditeur';
      case 'reader': return 'Observateur';
      default: return '';
    }
  }

  createChild(name: string) {
    if (!name) return;
    this.profileService.createLocalChild(name).subscribe();
  }

  acceptInvite(code: string) {
    if (!code) return;
    this.sharingService.joinDossier(code).subscribe();
  }
}
