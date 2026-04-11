import { Injectable, signal, Inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ProtocolItem {
  id: string;
  allergen: string;
  dose: number;
  frequencyDays: number;
  createdAt: string; // ISO date string without time 'YYYY-MM-DD'
}

export interface SymptomItem {
  id: string;
  label: string;
  emoji: string; // optional but always stored, empty string if not set
}

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
  private readonly PROTOCOL_KEY = 'allergy_track_protocols';
  private readonly PROTOCOL_START_KEY = 'allergy_track_start_date';
  private readonly SYMPTOMS_KEY = 'allergy_track_symptoms';
  
  public readonly protocols = signal<ProtocolItem[]>(this.getDefaultProtocols());
  public readonly protocolStartDate = signal<string | null>(null);
  public readonly symptoms = signal<SymptomItem[]>(SYMPTOM_PRESETS['reintroduction']);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.PROTOCOL_KEY);
      if (saved) {
        try {
          this.protocols.set(JSON.parse(saved));
        } catch(e) {
          console.error("Invalid protocol in local storage", e);
        }
      }
      
      const savedStart = localStorage.getItem(this.PROTOCOL_START_KEY);
      if (savedStart) {
        this.protocolStartDate.set(savedStart);
      }

      const savedSymptoms = localStorage.getItem(this.SYMPTOMS_KEY);
      if (savedSymptoms) {
        try {
          this.symptoms.set(JSON.parse(savedSymptoms));
        } catch(e) {
          console.error('Invalid symptoms in local storage', e);
        }
      }
    }

    effect(() => {
      const current = this.protocols();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.PROTOCOL_KEY, JSON.stringify(current));
      }
    });

    effect(() => {
      const start = this.protocolStartDate();
      if (isPlatformBrowser(this.platformId)) {
        if (start) {
          localStorage.setItem(this.PROTOCOL_START_KEY, start);
        } else {
          localStorage.removeItem(this.PROTOCOL_START_KEY);
        }
      }
    });

    effect(() => {
      const syms = this.symptoms();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.SYMPTOMS_KEY, JSON.stringify(syms));
      }
    });

    // In case there are old protocols without createdAt or frequencyDays, migrate them
    this.migrateProtocols();
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
