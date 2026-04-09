import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map, switchMap } from 'rxjs';
import { PocketbaseAdapterService } from './persistence/pocketbase-adapter.service';
import { DailyLog } from '../models/allergi-track.model';
import confetti from 'canvas-confetti';

export interface ScoringEvent {
  date: string;
  type: 'flame' | 'star' | 'trophy';
  change: number;
  reason?: string;
  isBroken?: boolean;
}

export interface GamificationState {
  regularStreak: number;
  perfectStreak: number;
  // Système de Tiers
  tier: 'flame' | 'star' | 'trophy';
  starsCount: number;
  daysToNextStar: number;
  trophyCount: number;
  
  hasMissedToday: boolean;
  hasMissedYesterday: boolean;
  hasPreviousRecords: boolean;
  showCongratulation: boolean;

  // Explications pour la supervision
  history: ScoringEvent[];
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private persistence = inject(PocketbaseAdapterService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  refresh() {
    this.refresh$.next();
  }

  getGamificationState(): Observable<GamificationState> {
    return this.refresh$.pipe(
      switchMap(() => this.calculateGamification())
    );
  }

  private calculateGamification(): Observable<GamificationState> {
    const today = new Date();
    const pastDate = new Date(today);
    // On requête jusqu'à 90 jours en arrière pour le streak courant
    pastDate.setDate(pastDate.getDate() - 90); 
    
    const startDate = this.formatDate(pastDate);
    const endDate = this.formatDate(today);

    return this.persistence.getDailyLogs(startDate, endDate).pipe(
      map(logs => {
        const state: GamificationState = {
          regularStreak: 0,
          perfectStreak: 0,
          tier: 'flame',
          starsCount: 0,
          daysToNextStar: 7,
          trophyCount: 0,
          hasMissedToday: false,
          hasMissedYesterday: false,
          hasPreviousRecords: logs.length > 0,
          showCongratulation: false,
          history: []
        };

        if (logs.length === 0) return state;

        const todayStr = this.formatDate(today);
        const yesterdayDate = new Date(today);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = this.formatDate(yesterdayDate);

        // Récupérer uniquement le dernier log par date (triés par -created par notre API)
        const latestLogsMap = new Map<string, DailyLog>();
        logs.forEach(log => {
          if (!latestLogsMap.has(log.date)) {
            latestLogsMap.set(log.date, log);
          }
        });

        const yesterdayLog = latestLogsMap.get(yesterdayStr);
        const todayLog = latestLogsMap.get(todayStr);

        // Alertes Gamification de Prise Manquée
        state.hasMissedYesterday = !yesterdayLog || yesterdayLog.intakes.some(i => !i.taken);
        state.hasMissedToday = !!todayLog && todayLog.intakes.some(i => !i.taken);

        // Calcul des historiques pour explication (Supervision)
        const history: ScoringEvent[] = [];
        let tempPerfect = 0;
        let tempRegular = 0;
        let hPtr = new Date(today);
        if (!todayLog) hPtr.setDate(hPtr.getDate() - 1);

        // On remonte jusqu'à 21 jours pour l'historique d'explication
        for (let i = 0; i < 21; i++) {
            const dateStr = this.formatDate(hPtr);
            const log = latestLogsMap.get(dateStr);
            
            if (!log) {
                history.push({ 
                    date: dateStr, 
                    type: 'flame', 
                    change: 0, 
                    isBroken: true,
                    reason: "Oubli total (aucune saisie)" 
                });
                break; // On s'arrête au premier blocage pour l'explication de la série actuelle
            }

            const isPerfect = !log.intakes.some(it => !it.taken);
            const isRegular = log.intakes.some(it => it.taken);

            if (isPerfect) {
                tempPerfect++;
                history.push({ 
                    date: dateStr, 
                    type: 'star', 
                    change: 1,
                    reason: "Journée parfaite ! 100% des doses"
                });
            } else if (isRegular) {
                tempRegular++;
                history.push({ 
                    date: dateStr, 
                    type: 'flame', 
                    change: 1,
                    reason: "Doses partielles, la flamme continue"
                });
                // Si on était dans une série parfaite, elle se brise ici pour l'étoile
                if (tempPerfect > 0) {
                     history[history.length-1].isBroken = true;
                     history[history.length-1].reason = "Dose manquée : l'étoile s'arrête mais la flamme reste !";
                     // On ne break pas car la flamme continue
                }
            } else {
                history.push({ 
                    date: dateStr, 
                    type: 'flame', 
                    change: 0, 
                    isBroken: true,
                    reason: "Aucune dose prise ce jour-là" 
                });
                break;
            }
            hPtr.setDate(hPtr.getDate() - 1);
        }
        state.history = history;

        // Calcul du Regular Streak (Flamme) : au moins 1 dose prise
        let currentRegular = 0;
        let datePtr = new Date(today);
        if (!todayLog) {
           datePtr.setDate(datePtr.getDate() - 1); // today is ignored if empty
        }
        while (currentRegular < 90) {
            const dateStr = this.formatDate(datePtr);
            const log = latestLogsMap.get(dateStr);
            // La condition régulière : log existe ET au moins 1 prise = true
            if (!log || !log.intakes.some(i => i.taken)) break;
            currentRegular++;
            datePtr.setDate(datePtr.getDate() - 1);
        }

        // Calcul du Perfect Streak (Étoile) : toutes les doses prises
        let currentPerfect = 0;
        datePtr = new Date(today);
        if (!todayLog) {
            datePtr.setDate(datePtr.getDate() - 1);
        }
        while (currentPerfect < 90) {
            const dateStr = this.formatDate(datePtr);
            const log = latestLogsMap.get(dateStr);
            // Condition parfaite : log existe ET aucune prise = false
            if (!log || log.intakes.some(i => !i.taken)) break;
            currentPerfect++;
            datePtr.setDate(datePtr.getDate() - 1);
        }

        state.regularStreak = currentRegular;
        state.perfectStreak = currentPerfect;

        // Logique des Tiers
        if (currentPerfect >= 28) {
          state.tier = 'trophy';
          state.trophyCount = Math.floor(currentPerfect / 28);
        } else if (currentPerfect >= 7) {
          state.tier = 'star';
          state.starsCount = Math.floor(currentPerfect / 7);
          state.daysToNextStar = 7 - (currentPerfect % 7);
        } else {
          state.tier = 'flame';
        }

        state.showCongratulation = currentRegular >= 14;

        return state;
      })
    );
  }

  checkAndCelebrate(state: GamificationState) {
    if (state.perfectStreak > 0 && state.perfectStreak % 7 === 0) {
      this.triggerCelebration();
    }
  }

  private triggerCelebration() {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#d946ef', '#10b981', '#f59e0b', '#f43f5e']
    });
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
