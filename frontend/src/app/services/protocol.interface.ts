import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ProtocolItem {
  id: string;
  allergen: string;
  dose: number;
  frequencyDays: number;
  createdAt: string; // ISO date string 'YYYY-MM-DD'
}

export interface SymptomItem {
  id: string;
  label: string;
  emoji: string;
}

export interface MedicsShieldItem {
  id: string;
  label: string;
  emoji: string;
}

export interface ProtocolAdapter {
  getProtocols(profileId: string): Observable<ProtocolItem[]>;
  saveProtocols(profileId: string, protocols: ProtocolItem[]): Observable<void>;
  
  getProtocolStartDate(profileId: string): Observable<string | null>;
  saveProtocolStartDate(profileId: string, date: string | null): Observable<void>;
  
  getSymptoms(profileId: string): Observable<SymptomItem[]>;
  saveSymptoms(profileId: string, symptoms: SymptomItem[]): Observable<void>;

  getMedicsShields(profileId: string): Observable<MedicsShieldItem[]>;
  saveMedicsShields(profileId: string, shields: MedicsShieldItem[]): Observable<void>;

  saveFullConfig(profileId: string, config: {
    protocols?: ProtocolItem[];
    startDate?: string | null;
    symptoms?: SymptomItem[];
    medicsShields?: MedicsShieldItem[];
  }): Observable<void>;
}

export const PROTOCOL_ADAPTER = new InjectionToken<ProtocolAdapter>('PROTOCOL_ADAPTER');
