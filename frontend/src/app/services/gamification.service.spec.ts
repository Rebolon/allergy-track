import { TestBed } from '@angular/core/testing';
import { GamificationService, GamificationState } from './gamification.service';
import { PERSISTENCE_ADAPTER } from './persistence/persistence.interface';
import { of } from 'rxjs';
import { DailyLog } from '../models/allergy-track.model';

describe('GamificationService', () => {
  let service: GamificationService;
  let persistenceMock: any;

  beforeEach(() => {
    persistenceMock = {
      getDailyLogs: () => of([])
    };

    TestBed.configureTestingModule({
      providers: [
        GamificationService,
        { provide: PERSISTENCE_ADAPTER, useValue: persistenceMock }
      ]
    });
    service = TestBed.inject(GamificationService);
  });

  const generateLogs = (dates: string[], takes: boolean[]): DailyLog[] => {
    return dates.map((date, i) => ({
      id: `id-${i}`,
      date: date,
      note: '',
      symptoms: [],
      updatedAt: '',
      updatedBy: '',
      treatments: [],
      intakes: [{ allergen: 'Test', dose: 1, taken: takes[i] }]
    }));
  };

  const getTodayOffsetStr = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial state when no logs exist', (done) => {
    service.getGamificationState().subscribe((state) => {
      expect(state.regularStreak).toBe(0);
      expect(state.perfectStreak).toBe(0);
      expect(state.tier).toBe('flame');
      done();
    });
  });

  it('should correctly calculate regular streak from consecutive taken days', (done) => {
    const today = getTodayOffsetStr(0);
    const yesterday = getTodayOffsetStr(-1);
    const twoDaysAgo = getTodayOffsetStr(-2);

    // Day 0: taken, Day -1: taken, Day -2: not taken
    const logs = generateLogs([today, yesterday, twoDaysAgo], [true, true, false]);
    persistenceMock.getDailyLogs = () => of(logs);
    service.refresh();

    service.getGamificationState().subscribe((state) => {
      expect(state.regularStreak).toBe(2);
      expect(state.perfectStreak).toBe(2);
      done();
    });
  });

  it('should calculate perfect star tier correctly for 7+ days', (done) => {
    const dates = [];
    const takes = [];
    for (let i = 0; i < 10; i++) {
      dates.push(getTodayOffsetStr(-i));
      takes.push(true);
    }
    const logs = generateLogs(dates, takes);
    persistenceMock.getDailyLogs = () => of(logs);
    service.refresh();

    service.getGamificationState().subscribe((state) => {
      expect(state.perfectStreak).toBe(10);
      expect(state.tier).toBe('star');
      expect(state.starsCount).toBe(1);
      done();
    });
  });
});
