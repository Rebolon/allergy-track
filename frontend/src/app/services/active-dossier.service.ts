import { Injectable, signal, effect, inject, computed, untracked } from '@angular/core';
import { ProtocolItem, SymptomItem, MedicsShieldItem, PROTOCOL_ADAPTER } from './protocol.interface';
import { AuthService } from './auth.service';
import { ThemeService, AppTheme } from './theme.service';
import { forkJoin } from 'rxjs';

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
    { id: 'msr2', label: 'Aerius/Aeromire', emoji: '💊' },
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
    { id: 'p1', allergen: 'Lait de vache', dose: 1, frequencyDays: 1, createdAt: new Date().toISOString().split('T')[0] },
    { id: 'p2', allergen: 'Oeuf', dose: 1, frequencyDays: 1, createdAt: new Date().toISOString().split('T')[0] }
  ],
  desensibilisation: [
    { id: 'p1', allergen: 'Pollens', dose: 1, frequencyDays: 1, createdAt: new Date().toISOString().split('T')[0] }
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
  public readonly protocolStartDate = signal<string | null>(null);
  public readonly symptoms = signal<SymptomItem[]>([]);
  public readonly medicsShields = signal<MedicsShieldItem[]>([]);
  
  private dataLoaded = signal(false);

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

    // Auto-save effect
    effect(() => {
      if (!this.dataLoaded()) return;

      const profile = this.auth.activeProfile();
      if (profile && this.auth.isAuthenticated()) {
        const payload = {
            protocols: this.protocols(),
            startDate: this.protocolStartDate(),
            symptoms: this.symptoms(),
            medicsShields: this.medicsShields()
        };
        untracked(() => {
          this.adapter.saveFullConfig(profile.id, payload).subscribe();
        });
      }
    });
  }

  private loadProfileData(profileId: string) {
    this.dataLoaded.set(false);
    
    forkJoin({
      protocols: this.adapter.getProtocols(profileId),
      startDate: this.adapter.getProtocolStartDate(profileId),
      symptoms: this.adapter.getSymptoms(profileId),
      shields: this.adapter.getMedicsShields(profileId)
    }).subscribe({
      next: ({ protocols, startDate, symptoms, shields }) => {
        // Atomic update
        this.protocols.set(protocols?.length ? protocols : PROTOCOL_PRESETS['reintroduction']);
        this.protocolStartDate.set(startDate);
        this.symptoms.set(symptoms?.length ? symptoms : SYMPTOM_PRESETS['reintroduction']);
        this.medicsShields.set(shields?.length ? shields : SHIELD_PRESETS['reintroduction']);
        
        this.migrateProtocols();
        this.dataLoaded.set(true);
      },
      error: () => {
        this.protocols.set(PROTOCOL_PRESETS['reintroduction']);
        this.symptoms.set(SYMPTOM_PRESETS['reintroduction']);
        this.medicsShields.set(SHIELD_PRESETS['reintroduction']);
        this.dataLoaded.set(true);
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
