import { Injectable, signal, effect, inject, computed } from '@angular/core';
import { ProtocolItem, SymptomItem, PROTOCOL_ADAPTER } from './protocol.interface';
import { AuthService } from './auth.service';
import { ThemeService, AppTheme } from './theme.service';
import { forkJoin } from 'rxjs';

export type { ProtocolItem, SymptomItem };

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
  
  private dataLoaded = signal(false);

  // Computed for UI
  public readonly currentTheme = computed(() => this.auth.activeProfile()?.themePreference || 'classic');

  constructor() {
    // Watch for profile changes to reload data
    effect(() => {
      const profile = this.auth.activeProfile();
      if (profile) {
        this.loadProfileData(profile.id);
        // Sync global theme with profile preference
        if (profile.themePreference) {
          this.theme.setTheme(profile.themePreference);
        }
      }
    }, { allowSignalWrites: true });

    // Auto-save effects - ONLY if data is already loaded to avoid overwriting with initial nulls
    effect(() => {
      const current = this.protocols();
      const profile = this.auth.activeProfile();
      if (this.dataLoaded() && profile && this.auth.isAuthenticated()) {
        this.adapter.saveProtocols(profile.id, current).subscribe();
      }
    });

    effect(() => {
      const start = this.protocolStartDate();
      const profile = this.auth.activeProfile();
      if (this.dataLoaded() && profile && this.auth.isAuthenticated()) {
        this.adapter.saveProtocolStartDate(profile.id, start).subscribe();
      }
    });

    effect(() => {
      const syms = this.symptoms();
      const profile = this.auth.activeProfile();
      if (this.dataLoaded() && profile && this.auth.isAuthenticated()) {
        this.adapter.saveSymptoms(profile.id, syms).subscribe();
      }
    });
  }

  private loadProfileData(profileId: string) {
    this.dataLoaded.set(false);
    
    forkJoin({
      protocols: this.adapter.getProtocols(profileId),
      startDate: this.adapter.getProtocolStartDate(profileId),
      symptoms: this.adapter.getSymptoms(profileId)
    }).subscribe({
      next: ({ protocols, startDate, symptoms }) => {
        this.protocols.set(protocols.length > 0 ? protocols : this.getDefaultProtocols());
        this.protocolStartDate.set(startDate);
        this.symptoms.set(symptoms.length > 0 ? symptoms : SYMPTOM_PRESETS['reintroduction']);
        this.migrateProtocols();
        this.dataLoaded.set(true);
      },
      error: (err) => {
        console.error('[ActiveDossierService] Load failed', err);
        // Fallback to defaults anyway to allow editing
        this.protocols.set(this.getDefaultProtocols());
        this.symptoms.set(SYMPTOM_PRESETS['reintroduction']);
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

  public applySymptomPreset(preset: 'reintroduction' | 'desensibilisation') {
    this.symptoms.set(SYMPTOM_PRESETS[preset].map(s => ({ ...s, id: crypto.randomUUID() })));
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
