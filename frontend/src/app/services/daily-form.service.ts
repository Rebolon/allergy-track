import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { DailyLog } from '../models/allergy-track.model';
import { DailyLogsService } from './daily-logs.service';
import { AuthService } from './auth.service';
import { ActiveDossierService, ProtocolItem } from './active-dossier.service';

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
  private dailyLogsService = inject(DailyLogsService);
  private auth = inject(AuthService);
  private protocolService = inject(ActiveDossierService);

  createForm(): FormGroup {
    const shields = this.protocolService.medicsShields();
    return this.fb.group({
      id: [crypto.randomUUID()],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      intakes: this.fb.array([], { validators: atLeastOneTakenValidator() }),
      symptoms: this.fb.array([], { validators: atLeastOneSymptomValidator() }),
      treatments: this.fb.array(
        shields.length > 0 
          ? shields.map(s => this.createTreatmentGroup(s.label))
          : [
              this.createTreatmentGroup('Antihistaminique'),
              this.createTreatmentGroup('Aerius/Aeromire'),
              this.createTreatmentGroup('Adrénaline')
            ]
      ),
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

    this.dailyLogsService.getDailyLog(profile.id, date).subscribe(log => {
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

        // Sync treatments with current config if names match, otherwise just patch what we have
        const currentShields = this.protocolService.medicsShields();
        
        // If we have a config, we re-build the array based on it
        if (currentShields.length > 0) {
          treatmentsArray.clear();
          currentShields.forEach(shield => {
            const savedTreatment = log.treatments.find(t => t.name === shield.label);
            const group = this.createTreatmentGroup(shield.label);
            if (savedTreatment) {
              group.patchValue(savedTreatment);
            }
            treatmentsArray.push(group);
          });
        } else {
          // Fallback legacy behavior
          log.treatments.forEach((treatment, i) => {
            if (treatmentsArray.at(i)) {
              treatmentsArray.at(i).patchValue(treatment);
            }
          });
        }

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

        // Reset intakes according to ActiveDossierService rules for this date
        intakesArray.clear();
        const activeProtocols = this.protocolService.protocols().filter(p => this.protocolService.isProtocolDue(p, date));
        activeProtocols.forEach(p => {
          intakesArray.push(this.createIntakeGroup(p.allergen, p.dose));
        });

        // Reset treatments based on current config
        const currentShields = this.protocolService.medicsShields();
        if (currentShields.length > 0) {
          treatmentsArray.clear();
          currentShields.forEach(s => {
            treatmentsArray.push(this.createTreatmentGroup(s.label));
          });
        } else {
          treatmentsArray.controls.forEach(ctrl => {
            ctrl.patchValue({ before: false, after: false });
          });
        }

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

      return this.dailyLogsService.saveDailyLog(log);
    }
    return throwError(() => new Error('Form is invalid'));
  }
}
