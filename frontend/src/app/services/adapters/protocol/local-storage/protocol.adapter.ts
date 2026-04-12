import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { ProtocolAdapter, ProtocolItem, SymptomItem, MedicsShieldItem } from '../../../protocol.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageProtocolAdapter implements ProtocolAdapter {
  private platformId = inject(PLATFORM_ID);

  private PROTOCOL_KEY(profileId: string) { return `allergy_track_protocols_${profileId}`; }
  private PROTOCOL_START_KEY(profileId: string) { return `allergy_track_start_date_${profileId}`; }
  private SYMPTOMS_KEY(profileId: string) { return `allergy_track_symptoms_${profileId}`; }
  private SHIELDS_KEY(profileId: string) { return `allergy_track_shields_${profileId}`; }

  getProtocols(profileId: string): Observable<ProtocolItem[]> {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.PROTOCOL_KEY(profileId));
      if (saved) {
        try {
          return of(JSON.parse(saved));
        } catch (e) {
          return of([]);
        }
      }
    }
    return of([]);
  }

  saveProtocols(profileId: string, protocols: ProtocolItem[]): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.PROTOCOL_KEY(profileId), JSON.stringify(protocols));
    }
    return of(undefined);
  }

  getProtocolStartDate(profileId: string): Observable<string | null> {
    if (isPlatformBrowser(this.platformId)) {
      return of(localStorage.getItem(this.PROTOCOL_START_KEY(profileId)));
    }
    return of(null);
  }

  saveProtocolStartDate(profileId: string, date: string | null): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      if (date) {
        localStorage.setItem(this.PROTOCOL_START_KEY(profileId), date);
      } else {
        localStorage.removeItem(this.PROTOCOL_START_KEY(profileId));
      }
    }
    return of(undefined);
  }

  getSymptoms(profileId: string): Observable<SymptomItem[]> {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.SYMPTOMS_KEY(profileId));
      if (saved) {
        try {
          return of(JSON.parse(saved));
        } catch (e) {
          return of([]);
        }
      }
    }
    return of([]);
  }

  saveSymptoms(profileId: string, symptoms: SymptomItem[]): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.SYMPTOMS_KEY(profileId), JSON.stringify(symptoms));
    }
    return of(undefined);
  }

  getMedicsShields(profileId: string): Observable<MedicsShieldItem[]> {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.SHIELDS_KEY(profileId));
      if (saved) {
        try {
          return of(JSON.parse(saved));
        } catch (e) {
          return of([]);
        }
      }
    }
    return of([]);
  }

  saveMedicsShields(profileId: string, shields: MedicsShieldItem[]): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.SHIELDS_KEY(profileId), JSON.stringify(shields));
    }
    return of(undefined);
  }

  saveFullConfig(profileId: string, config: any): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      if (config.protocols) localStorage.setItem(this.PROTOCOL_KEY(profileId), JSON.stringify(config.protocols));
      if (config.startDate !== undefined) {
        if (config.startDate) localStorage.setItem(this.PROTOCOL_START_KEY(profileId), config.startDate);
        else localStorage.removeItem(this.PROTOCOL_START_KEY(profileId));
      }
      if (config.symptoms) localStorage.setItem(this.SYMPTOMS_KEY(profileId), JSON.stringify(config.symptoms));
      if (config.medicsShields) localStorage.setItem(this.SHIELDS_KEY(profileId), JSON.stringify(config.medicsShields));
    }
    return of(undefined);
  }
}
