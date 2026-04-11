import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map, switchMap, shareReplay } from 'rxjs';
import { PERSISTENCE_ADAPTER } from './persistence/persistence.interface';
import { DailyLog } from '../models/allergy-track.model';
import { ProtocolService } from './protocol.service';
import { formatDate, getTodayStr, offsetDate } from '../utils/date.utils';
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
  private persistence = inject(PERSISTENCE_ADAPTER);
  private protocolService = inject(ProtocolService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  private state$ = this.refresh$.pipe(
    switchMap(() => this.calculateGamification()),
    shareReplay(1)
  );

  refresh() {
    this.refresh$.next();
  }

  getGamificationState(): Observable<GamificationState> {
    return this.state$;
  }

  private calculateGamification(): Observable<GamificationState> {
    const today = new Date();
    const pastDate = offsetDate(-90, today);

    const startDate = formatDate(pastDate);
    const endDate = formatDate(today);

    return this.persistence.getDailyLogs(startDate, endDate).pipe(
      map(logs => {
        const state = this.createInitialState(logs.length > 0);
        if (logs.length === 0) return state;

        const latestLogsMap = this.buildLatestLogsMap(logs);
        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(offsetDate(-1, today));

        const yesterdayLog = latestLogsMap.get(yesterdayStr);
        const todayLog = latestLogsMap.get(todayStr);

        state.hasMissedYesterday = !yesterdayLog || yesterdayLog.intakes.some(i => !i.taken);
        state.hasMissedToday = !!todayLog && todayLog.intakes.some(i => !i.taken);

        const configuredStart = this.protocolService.protocolStartDate();
        
        state.history = this.generateHistory(latestLogsMap, today, configuredStart);

        state.regularStreak = this.calculateStreak(latestLogsMap, today, todayLog, configuredStart, (log) => log.intakes.some(i => i.taken));
        state.perfectStreak = this.calculateStreak(latestLogsMap, today, todayLog, configuredStart, (log) => !log.intakes.some(i => !i.taken));

        this.applyTierLogic(state, state.perfectStreak);
        state.showCongratulation = state.regularStreak >= 14;

        return state;
      })
    );
  }

  private createInitialState(hasRecords: boolean): GamificationState {
    return {
      regularStreak: 0,
      perfectStreak: 0,
      tier: 'flame',
      starsCount: 0,
      daysToNextStar: 7,
      trophyCount: 0,
      hasMissedToday: false,
      hasMissedYesterday: false,
      hasPreviousRecords: hasRecords,
      showCongratulation: false,
      history: []
    };
  }

  private buildLatestLogsMap(logs: DailyLog[]): Map<string, DailyLog> {
    const map = new Map<string, DailyLog>();
    logs.forEach(log => {
      if (!map.has(log.date)) map.set(log.date, log);
    });
    return map;
  }

  private calculateStreak(logsMap: Map<string, DailyLog>, today: Date, todayLog: DailyLog | undefined, stopDate: string | null, condition: (log: DailyLog) => boolean): number {
    let streak = 0;
    let datePtr = new Date(today);
    if (!todayLog) datePtr = offsetDate(-1, datePtr);

    while (streak < 90) {
      const dateStr = formatDate(datePtr);
      if (stopDate && dateStr < stopDate) break; // Reached start of protocol!
      
      const log = logsMap.get(dateStr);
      if (!log || !condition(log)) break;
      streak++;
      datePtr = offsetDate(-1, datePtr);
    }
    return streak;
  }

  private generateHistory(logsMap: Map<string, DailyLog>, today: Date, stopDate: string | null): ScoringEvent[] {
    const history: ScoringEvent[] = [];
    let tempPerfect = 0;
    let tempRegular = 0;

    let hPtr = new Date(today);
    if (!logsMap.has(formatDate(hPtr))) hPtr = offsetDate(-1, hPtr);

    for (let i = 0; i < 21; i++) {
      const dateStr = formatDate(hPtr);
      if (stopDate && dateStr < stopDate) break; // Stop history rendering if we exceed the start date
      
      const log = logsMap.get(dateStr);

      if (!log) {
        history.push({ date: dateStr, type: 'flame', change: 0, isBroken: true, reason: "Oubli total (aucune saisie)" });
        break;
      }

      const isPerfect = !log.intakes.some(it => !it.taken);
      const isRegular = log.intakes.some(it => it.taken);

      if (isPerfect) {
        tempPerfect++;
        const eventType = tempPerfect >= 28 ? 'trophy' : 'star';
        history.push({
          date: dateStr,
          type: eventType,
          change: 1,
          reason: tempPerfect >= 28 ? "Excellence : 28 jours parfaits ! 🏆" : "Journée parfaite ! 100% des doses"
        });
      } else if (isRegular) {
        tempRegular++;
        history.push({ date: dateStr, type: 'flame', change: 1, reason: "Doses partielles, la flamme continue" });
        if (tempPerfect > 0) {
          history[history.length - 1].isBroken = true;
          history[history.length - 1].reason = "Dose manquée : la progression vers l'étoile/trophée s'arrête mais la flamme reste !";
        }
        tempPerfect = 0;
      } else {
        history.push({ date: dateStr, type: 'flame', change: 0, isBroken: true, reason: "Aucune dose prise ce jour-là" });
        break;
      }
      hPtr = offsetDate(-1, hPtr);
    }
    return history;
  }

  private applyTierLogic(state: GamificationState, perfect: number) {
    if (perfect >= 28) {
      state.tier = 'trophy';
      state.trophyCount = Math.floor(perfect / 28);
    } else if (perfect >= 7) {
      state.tier = 'star';
      state.starsCount = Math.floor(perfect / 7);
      state.daysToNextStar = 7 - (perfect % 7);
    } else {
      state.tier = 'flame';
    }
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
}
