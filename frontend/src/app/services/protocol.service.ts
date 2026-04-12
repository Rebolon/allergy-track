import { Injectable, signal, effect, inject } from '@angular/core';
import { ProtocolItem, SymptomItem, PROTOCOL_ADAPTER } from './protocol.interface';
import { AuthService } from './auth.service';

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
export class ProtocolService {
  private auth = inject(AuthService);
  private adapter = inject(PROTOCOL_ADAPTER);

  public readonly protocols = signal<ProtocolItem[]>(this.getDefaultProtocols());
  public readonly protocolStartDate = signal<string | null>(null);
  public readonly symptoms = signal<SymptomItem[]>(SYMPTOM_PRESETS['reintroduction']);

  constructor() {
    // Watch for profile changes to reload data
    effect(() => {
      const profile = this.auth.activeProfile();
      if (profile) {
        this.loadProfileData(profile.id);
      }
    }, { allowSignalWrites: true });

    // Auto-save effects
    effect(() => {
      const current = this.protocols();
      const profile = this.auth.activeProfile();
      if (profile && this.auth.isAuthenticated()) {
        this.adapter.saveProtocols(profile.id, current).subscribe();
      }
    });

    effect(() => {
      const start = this.protocolStartDate();
      const profile = this.auth.activeProfile();
      if (profile && this.auth.isAuthenticated()) {
        this.adapter.saveProtocolStartDate(profile.id, start).subscribe();
      }
    });

    effect(() => {
      const syms = this.symptoms();
      const profile = this.auth.activeProfile();
      if (profile && this.auth.isAuthenticated()) {
        this.adapter.saveSymptoms(profile.id, syms).subscribe();
      }
    });
  }

  private loadProfileData(profileId: string) {
    this.adapter.getProtocols(profileId).subscribe(protocols => {
      if (protocols && protocols.length > 0) {
        this.protocols.set(protocols);
      } else {
        this.protocols.set(this.getDefaultProtocols());
      }
      this.migrateProtocols();
    });

    this.adapter.getProtocolStartDate(profileId).subscribe(start => {
      this.protocolStartDate.set(start);
    });

    this.adapter.getSymptoms(profileId).subscribe(symptoms => {
      if (symptoms && symptoms.length > 0) {
        this.symptoms.set(symptoms);
      } else {
        this.symptoms.set(SYMPTOM_PRESETS['reintroduction']);
      }
    });
  }

  public updateStartDate(dateStr: string) {
    this.protocolStartDate.set(dateStr);
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

    // Check if target date is >= createdAt
    if (targetDate < item.createdAt) return false;

    // Calculate diff in days
    const createdDate = new Date(item.createdAt);
    const target = new Date(targetDate);

    // Reset times to compare strictly dates
    createdDate.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(target.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays % item.frequencyDays === 0;
  }
}
