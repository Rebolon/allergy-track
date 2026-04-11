import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { DailyLog } from '../models/allergy-track.model';
import { PERSISTENCE_ADAPTER } from './persistence/persistence.interface';
import { AuthService } from './auth.service';
import { ProtocolService, ProtocolItem } from './protocol.service';

export function atLeastOneTakenValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      if (control.length === 0) return null; // No intakes required
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
  private persistence = inject(PERSISTENCE_ADAPTER);
  private auth = inject(AuthService);
  private protocolService = inject(ProtocolService);

  createForm(): FormGroup {
    return this.fb.group({
      id: [crypto.randomUUID()],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      intakes: this.fb.array([], { validators: atLeastOneTakenValidator() }),
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
    const protocolStart = this.protocolService.protocolStartDate();
    const isBeforeProtocol = protocolStart ? date < protocolStart : false;

    const profile = this.auth.activeProfile();
    if (!profile) return;

    this.persistence.getDailyLog(profile.id, date).subscribe(log => {
      const intakesArray = form.get('intakes') as FormArray;
      const treatmentsArray = form.get('treatments') as FormArray;
      const symptomsArray = form.get('symptoms') as FormArray;

      if (log) {
        form.patchValue({
          id: log.id,
          date: log.date,
          note: log.note || ''
        });

        // Re-create the form controls based on saved log
        intakesArray.clear();
        log.intakes.forEach(intake => {
          const group = this.createIntakeGroup(intake.allergen, intake.dose);
          group.patchValue(intake);
          intakesArray.push(group);
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

        // Reset intakes according to ProtocolService rules for this date
        intakesArray.clear();
        const activeProtocols = this.protocolService.protocols().filter(p => this.protocolService.isProtocolDue(p, date));
        activeProtocols.forEach(p => {
          intakesArray.push(this.createIntakeGroup(p.allergen, p.dose));
        });

        // Reset treatments
        treatmentsArray.controls.forEach(ctrl => {
          ctrl.patchValue({ before: false, after: false });
        });

        const symptomsArray = form.get('symptoms') as FormArray;
        symptomsArray.clear();
      }

      if (isFuture || isBeforeProtocol) {
        form.disable();
      } else {
        form.enable();
      }
    });
  }

  saveLog(form: FormGroup): Observable<DailyLog> {
    if (form.valid) {
      const profile = this.auth.activeProfile();
      const user = this.auth.currentUser();
      
      if (!profile || !user) return throwError(() => new Error('No active profile'));

      const log: DailyLog = {
        ...form.value,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
        profileId: profile.id
      };

      return this.persistence.saveDailyLog(log);
    }
    return throwError(() => new Error('Form is invalid'));
  }
}
