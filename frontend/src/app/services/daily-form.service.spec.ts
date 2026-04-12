import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DailyFormService, atLeastOneTakenValidator, atLeastOneSymptomValidator } from './daily-form.service';
import { DailyLogsService } from './daily-logs.service';
import { AuthService } from './auth.service';
import { FormBuilder, FormArray, FormControl } from '@angular/forms';
import { of } from 'rxjs';

describe('DailyFormService', () => {
  let service: DailyFormService;
  let pbMock: any;
  let authMock: any;

  beforeEach(() => {
    pbMock = {
      getDailyLog: vi.fn().mockReturnValue(of(null)),
      saveDailyLog: vi.fn()
    };
    authMock = {
      currentUser: () => ({ id: 'u1' })
    };

    TestBed.configureTestingModule({
      providers: [
        DailyFormService,
        FormBuilder,
        { provide: DAILY_LOGS_ADAPTER, useValue: pbMock },
        { provide: AuthService, useValue: authMock }
      ]
    });
    service = TestBed.inject(DailyFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Validators', () => {
    it('atLeastOneTakenValidator should return error if none taken', () => {
      const fb = TestBed.inject(FormBuilder);
      const arr = fb.array([
        fb.group({ taken: [false] }),
        fb.group({ taken: [false] })
      ]);
      const validator = atLeastOneTakenValidator();
      expect(validator(arr)).toEqual({ requireAtLeastOneTaken: true });
    });

    it('atLeastOneTakenValidator should return null if at least one taken', () => {
      const fb = TestBed.inject(FormBuilder);
      const arr = fb.array([
        fb.group({ taken: [false] }),
        fb.group({ taken: [true] })
      ]);
      const validator = atLeastOneTakenValidator();
      expect(validator(arr)).toBeNull();
    });

    it('atLeastOneSymptomValidator should return error if empty', () => {
      const fb = TestBed.inject(FormBuilder);
      const arr = fb.array([]);
      const validator = atLeastOneSymptomValidator();
      expect(validator(arr)).toEqual({ requireAtLeastOneSymptom: true });
    });

    it('atLeastOneSymptomValidator should return null if min 1 symptom', () => {
      const fb = TestBed.inject(FormBuilder);
      const arr = fb.array([new FormControl('Rien')]);
      const validator = atLeastOneSymptomValidator();
      expect(validator(arr)).toBeNull();
    });
  });

  describe('loadLogForDate', () => {
    it('should reset to defaults if no log exists for the date', () => {
      const form = service.createForm();
      const testDate = '2023-10-10';
      service.loadLogForDate(form, testDate);
      
      expect(form.get('date')?.value).toBe(testDate);
      expect((form.get('intakes') as FormArray).at(0).get('taken')?.value).toBe(false);
      expect((form.get('symptoms') as FormArray).length).toBe(0);
    });

    it('should patch form if log exists', () => {
      const form = service.createForm();
      const testDate = '2023-10-10';
      pbMock.getDailyLog.and.returnValue(of({
        id: '123',
        date: testDate,
        note: 'Test note',
        intakes: [{allergen: 'Test', dose: 2, taken: true}],
        treatments: [],
        symptoms: ['Rien']
      }));

      service.loadLogForDate(form, testDate);
      expect(form.get('note')?.value).toBe('Test note');
      expect((form.get('symptoms') as FormArray).at(0).value).toBe('Rien');
    });
  });
});
