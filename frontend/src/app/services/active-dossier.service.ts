import { Injectable, signal, effect, inject, computed, untracked } from '@angular/core';
import { ProtocolItem, SymptomItem, MedicsShieldItem, PROTOCOL_ADAPTER } from './protocol.interface';
import { AuthService } from './auth.service';
import { ThemeService, AppTheme } from './theme.service';
import { forkJoin, Observable, of } from 'rxjs';

export type { ProtocolItem, SymptomItem, MedicsShieldItem };

export const SYMPTOM_PRESETS: Record<string, SymptomItem[]> = {
  reintroduction: [
    { id: 'r1', label: 'Démangeaisons bouche', emoji: '👄' },
    { id: 'r2', label: 'Respiratoire', emoji: '🫁' },
    { id: 'r3', label: 'Abdominal', emoji: '🤢' },
    { id: 'r4', label: 'Autres', emoji: '🤔' },
  ],
  desensibilisation: [
    { id: 'd1', label: 'Démangeaisons bouche', emoji: '👄' },
    { id: 'd2', label: 'Démangeaisons oreille / gorge', emoji: '👂' },
    { id: 'd3', label: 'Gonflement lèvres', emoji: '💋' },
  ]
};

export const SHIELD_PRESETS: Record<string, MedicsShieldItem[]> = {
  reintroduction: [
    { id: 'msr1', label: 'Antihistaminique', emoji: '💊' },
    { id: 'msr2', label: 'Aerius/Aeromire', emoji: '💨' },
    { id: 'msr3', label: 'Adrénaline', emoji: '💉' },
  ],
  desensibilisation: [
    { id: 'msd1', label: 'Antihistaminique', emoji: '💊' },
    { id: 'msd2', label: 'Gouttes occulaires', emoji: '💧' },
    { id: 'msd3', label: 'Ventoline', emoji: '💨' },
  ]
};

export const PROTOCOL_PRESETS: Record<string, ProtocolItem[]> = {
  reintroduction: [
    { id: 'p1', allergen: 'Cracotte à la noix', dose: 1.5, frequencyDays: 1, createdAt: new Date().toISOString().split('T')[0] },
    { id: 'p2', allergen: 'Noix de cajou', dose: 1.5, frequencyDays: 1, createdAt: new Date().toISOString().split('T')[0] },
    { id: 'p3', allergen: 'Arachide', dose: 1.5, frequencyDays: 1, createdAt: new Date().toISOString().split('T')[0] }
  ],
  desensibilisation: [
    { id: 'p1', allergen: 'Acariens', dose: 1, frequencyDays: 1, createdAt: new Date().toISOString().split('T')[0] }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ActiveDossierService {
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private adapter = inject(PROTOCOL_ADAPTER);

  public readonly protocols = signal<ProtocolItem[]>([]);
  public readonly protocolStartDate = signal<string | null>(new Date().toISOString().split('T')[0]);
  public readonly symptoms = signal<SymptomItem[]>([]);
  public readonly medicsShields = signal<MedicsShieldItem[]>([]);
  
  private dataLoaded = signal(false);
  private lastLoadedProfileId: string | null = null;

  // Computed for UI
  public readonly currentTheme = computed(() => this.auth.activeProfile()?.themePreference || 'classic');

  constructor() {
    // Watch for profile changes to reload data
    effect(() => {
      const profile = this.auth.activeProfile();
      if (profile) {
        untracked(() => this.loadProfileData(profile.id));
        // Sync global theme with profile preference
        if (profile.themePreference) {
          untracked(() => this.theme.setTheme(profile.themePreference));
        }
      }
    });
  }

  public saveCurrentConfig(): Observable<void> {
    const profile = this.auth.activeProfile();
    if (!profile || !this.auth.isAuthenticated()) return of(undefined);

    const payload = {
        protocols: this.protocols(),
        startDate: this.protocolStartDate(),
        symptoms: this.symptoms(),
        medicsShields: this.medicsShields()
    };
    return this.adapter.saveFullConfig(profile.id, payload);
  }

  public applyProtocolTypePreset(type: 'reintroduction' | 'desensibilisation') {
    this.applySymptomPreset(type);
    this.applyShieldPreset(type);
    this.protocols.set(PROTOCOL_PRESETS[type].map(p => ({ ...p, id: crypto.randomUUID() })));
  }

  private loadProfileData(profileId: string) {
    if (!profileId || this.lastLoadedProfileId === profileId) return;
    this.lastLoadedProfileId = profileId;
    this.dataLoaded.set(false);
    
    console.log('[ActiveDossierService] Loading profile data for:', profileId);
    
    this.adapter.getFullConfig(profileId).subscribe({
      next: (config) => {
        untracked(() => {
          this.protocols.set(config.protocols?.length ? config.protocols : PROTOCOL_PRESETS['reintroduction']);
          this.protocolStartDate.set(config.startDate || new Date().toISOString().split('T')[0]);
          this.symptoms.set(config.symptoms?.length ? config.symptoms : SYMPTOM_PRESETS['reintroduction']);
          this.medicsShields.set(config.medicsShields?.length ? config.medicsShields : SHIELD_PRESETS['reintroduction']);
          this.migrateProtocols();
          this.dataLoaded.set(true);
        });
      },
      error: (err) => {
        console.error('[ActiveDossierService] Load failed', err);
        untracked(() => {
          this.protocols.set(PROTOCOL_PRESETS['reintroduction']);
          this.dataLoaded.set(true);
        });
      }
    });
  }

  public updateStartDate(dateStr: string) {
    this.protocolStartDate.set(dateStr);
  }

  public updateTheme(newTheme: AppTheme) {
    this.auth.updateProfileTheme(newTheme);
  }

  private migrateProtocols() {
    const current = this.protocols();
    let migrated = false;
    const today = new Date().toISOString().split('T')[0];
    const newProtocols = current.map(p => {
      if (!p.frequencyDays || !p.createdAt) {
        migrated = true;
        return {
          ...p,
          frequencyDays: p.frequencyDays || 1,
          createdAt: p.createdAt || today
        };
      }
      return p;
    });

    if (migrated) {
      this.protocols.set(newProtocols);
    }
  }

  private getDefaultProtocols(): ProtocolItem[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: crypto.randomUUID(), allergen: 'Cracotte à la noix', dose: 1.5, frequencyDays: 1, createdAt: today },
      { id: crypto.randomUUID(), allergen: 'Noix de cajou', dose: 1.5, frequencyDays: 1, createdAt: today },
      { id: crypto.randomUUID(), allergen: 'Cacahuètes', dose: 1.5, frequencyDays: 1, createdAt: today }
    ];
  }

  public updateProtocols(newProtocols: ProtocolItem[]) {
    this.protocols.set(newProtocols);
  }

  public updateSymptoms(newSymptoms: SymptomItem[]) {
    this.symptoms.set(newSymptoms);
  }

  public updateMedicsShields(newShields: MedicsShieldItem[]) {
    this.medicsShields.set(newShields);
  }

  public applySymptomPreset(preset: 'reintroduction' | 'desensibilisation') {
    this.symptoms.set(SYMPTOM_PRESETS[preset].map(s => ({ ...s, id: crypto.randomUUID() })));
  }

  public applyShieldPreset(preset: 'reintroduction' | 'desensibilisation') {
    this.medicsShields.set(SHIELD_PRESETS[preset].map(s => ({ ...s, id: crypto.randomUUID() })));
  }

  public isProtocolDue(item: ProtocolItem, targetDate: string): boolean {
    if (item.frequencyDays === 1) return true;

    if (targetDate < item.createdAt) return false;

    const createdDate = new Date(item.createdAt);
    const target = new Date(targetDate);
    
    createdDate.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(target.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays % item.frequencyDays === 0;
  }
}
