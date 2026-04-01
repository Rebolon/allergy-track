import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn, AbstractControl, ValidationErrors  } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { DailyLog } from '../models/allergi-track.model';
import { PocketbaseAdapterService } from './persistence/pocketbase-adapter.service';
import { AuthService } from './auth.service';

export function atLeastOneTakenValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      const hasTaken = control.controls.some(c => c.get('taken')?.value === true);
      return hasTaken ? null : { requireAtLeastOneTaken: true };
    }
    return null;
  };
}

export function atLeastOneSymptomValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      return control.length > 0 ? null : { requireAtLeastOneSymptom: true };
    }
    return null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DailyFormService {
  private fb = inject(FormBuilder);
  private persistence = inject(PocketbaseAdapterService);
  private auth = inject(AuthService);

  createForm(): FormGroup {
    return this.fb.group({
      id: [crypto.randomUUID()],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      intakes: this.fb.array([
        this.createIntakeGroup('Cracotte à la Noix', 1.5),
        this.createIntakeGroup('Noix de Cajou', 1.5),
        this.createIntakeGroup('Cacahuètes', 1.5)
      ], { validators: atLeastOneTakenValidator() }),
      symptoms: this.fb.array([], { validators: atLeastOneSymptomValidator() }),
      treatments: this.fb.array([
        this.createTreatmentGroup('Antihistaminique'),
        this.createTreatmentGroup('Aerius/Aeromire'),
        this.createTreatmentGroup('Adrénaline')
      ]),
      note: ['']
    });
  }

  private createIntakeGroup(allergen: string, defaultDose: number): FormGroup {
    return this.fb.group({
      allergen: [allergen, Validators.required],
      dose: [defaultDose, [Validators.required, Validators.min(0)]],
      taken: [false]
    });
  }

  private createTreatmentGroup(name: string): FormGroup {
    return this.fb.group({
      name: [name, Validators.required],
      before: [false],
      after: [false]
    });
  }

  loadLogForDate(form: FormGroup, date: string) {
    const today = new Date().toISOString().split('T')[0];
    const isFuture = date > today;

    this.persistence.getDailyLog(date).subscribe(log => {
      const intakesArray = form.get('intakes') as FormArray;
      const treatmentsArray = form.get('treatments') as FormArray;
      const symptomsArray = form.get('symptoms') as FormArray;

      if (log) {
        form.patchValue({
          id: log.id,
          date: log.date,
          note: log.note || ''
        });

        // Explicitly patch intakes
        log.intakes.forEach((intake, i) => {
          if (intakesArray.at(i)) {
            intakesArray.at(i).patchValue(intake);
          }
        });

        // Explicitly patch treatments
        log.treatments.forEach((treatment, i) => {
          if (treatmentsArray.at(i)) {
            treatmentsArray.at(i).patchValue(treatment);
          }
        });

        // Patch symptoms
        symptomsArray.clear();
        log.symptoms.forEach(symptom => {
          symptomsArray.push(new FormControl(symptom));
        });
      } else {
        // Reset to defaults for new date
        form.patchValue({
          id: crypto.randomUUID(),
          date: date,
          note: '',
        });

        // Reset intakes
        intakesArray.controls.forEach(ctrl => {
          ctrl.patchValue({ dose: 1.5, taken: false });
        });

        // Reset treatments
        treatmentsArray.controls.forEach(ctrl => {
          ctrl.patchValue({ before: false, after: false });
        });

        const symptomsArray = form.get('symptoms') as FormArray;
        symptomsArray.clear();
      }

      if (isFuture) {
        form.disable();
      } else {
        form.enable();
      }
    });
  }

  saveLog(form: FormGroup): Observable<DailyLog> {
    if (form.valid) {
      const log: DailyLog = {
        ...form.value,
        updatedAt: new Date().toISOString(),
        updatedBy: this.auth.currentUser().id
      };
      
      return this.persistence.saveDailyLog(log);
    }
    return throwError(() => new Error('Form is invalid'));
  }
}
