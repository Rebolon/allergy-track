import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map, switchMap, shareReplay, forkJoin, of, tap } from 'rxjs';
import { DailyLogsService } from './daily-logs.service';
import { DailyLog, GamificationData } from '../models/allergy-track.model';
import { ActiveDossierService } from './active-dossier.service';
import { AuthService } from './auth.service';
import { GAMIFICATION_ADAPTER } from './gamification.interface';
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
  
  // Persistent points
  totalStreakPoints: number;
  perfectPoints: number;
  longestStreak: number;

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
  
  // Internal persistence info
  persistedId?: string;
  lastCelebrationAt?: string;
  lastPointAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private dailyLogsService = inject(DailyLogsService);
  private protocolService = inject(ActiveDossierService);
  private auth = inject(AuthService);
  private gamificationAdapter = inject(GAMIFICATION_ADAPTER);
  
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
    const activeProfile = this.auth.activeProfile();
    
    if (!activeProfile) {
      return of(this.createInitialState(false));
    }

    const pastDate = offsetDate(-90, today);
    const startDate = formatDate(pastDate);
    const endDate = formatDate(today);

    return forkJoin({
      logs: this.dailyLogsService.getDailyLogs(activeProfile.id, startDate, endDate),
      persisted: this.gamificationAdapter.getGamificationData(activeProfile.id)
    }).pipe(
      map(({ logs, persisted }) => {
        const state = this.createInitialState(logs.length > 0);
        if (persisted) {
          state.persistedId = persisted.id;
          state.totalStreakPoints = persisted.totalStreakPoints || 0;
          state.perfectPoints = persisted.perfectPoints || 0;
          state.longestStreak = persisted.longestStreak || 0;
          state.lastCelebrationAt = persisted.lastCelebrationAt;
          state.lastPointAt = persisted.lastPointAt;
        }

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

        // Actualisation des records persistés si nécessaire
        if (state.regularStreak > state.longestStreak) {
          state.longestStreak = state.regularStreak;
        }

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
      totalStreakPoints: 0,
      perfectPoints: 0,
      longestStreak: 0,
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

  saveGamification(state: GamificationState): Observable<GamificationData> {
    const profileId = this.auth.activeProfile()?.id;
    if (!profileId) return of({} as GamificationData);

    const data: GamificationData = {
      id: state.persistedId,
      profileId,
      totalStreakPoints: state.totalStreakPoints,
      perfectPoints: state.perfectPoints,
      longestStreak: state.longestStreak,
      lastCelebrationAt: state.lastCelebrationAt || '',
      lastPointAt: state.lastPointAt || ''
    };

    return this.gamificationAdapter.saveGamificationData(data).pipe(
      tap(saved => {
        state.persistedId = saved.id;
      })
    );
  }

  checkAndCelebrate(state: GamificationState) {
    const today = getTodayStr();
    let needsSave = false;

    // 1. Points Quotidiens (Anti-doublon)
    if (state.lastPointAt !== today) {
       // Si on a pris des doses aujourd'hui (regularStreak > 0)
       if (state.regularStreak > 0) {
         state.totalStreakPoints += 1;
         state.lastPointAt = today;
         needsSave = true;
         
         // Point bonus pour semaine parfaite ?
         if (state.perfectStreak > 0 && state.perfectStreak % 7 === 0) {
            state.perfectPoints += 1;
         }
       }
    }

    // 2. Célébration (Anti-doublon)
    if (state.lastCelebrationAt !== today) {
      if (state.perfectStreak > 0 && state.perfectStreak % 7 === 0) {
        state.lastCelebrationAt = today;
        this.triggerCelebration();
        needsSave = true;
      }
    }

    if (needsSave) {
      this.saveGamification(state).subscribe();
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
