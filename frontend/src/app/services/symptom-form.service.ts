import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActiveDossierService, SymptomItem, SYMPTOM_PRESETS } from './active-dossier.service';

@Injectable({
  providedIn: 'root'
})
export class SymptomFormService {
  private fb = inject(FormBuilder);
  private activeDossier = inject(ActiveDossierService);

  createForm(): FormGroup {
    return this.fb.group({
      items: this.fb.array([])
    });
  }

  initForm(form: FormGroup) {
    const symptomsArray = form.get('items') as FormArray;
    symptomsArray.clear();
    const current = this.activeDossier.symptoms();
    current.forEach(s => {
      symptomsArray.push(this.createSymptomFormGroup(s));
    });
  }

  createSymptomFormGroup(item?: SymptomItem): FormGroup {
    return this.fb.group({
      id: [item?.id || crypto.randomUUID()],
      label: [item?.label || '', Validators.required],
      emoji: [item?.emoji || '']
    });
  }

  addSymptom(form: FormGroup) {
    const symptomsArray = form.get('items') as FormArray;
    symptomsArray.push(this.createSymptomFormGroup());
    form.markAsDirty();
  }

  removeSymptom(form: FormGroup, index: number) {
    const symptomsArray = form.get('items') as FormArray;
    symptomsArray.removeAt(index);
    form.markAsDirty();
  }

  applyPreset(form: FormGroup, preset: 'reintroduction' | 'desensibilisation') {
    const symptomsArray = form.get('items') as FormArray;
    symptomsArray.clear();
    SYMPTOM_PRESETS[preset].forEach(s => {
      symptomsArray.push(this.createSymptomFormGroup({ ...s, id: crypto.randomUUID() }));
    });
    form.markAsDirty();
  }

  save(form: FormGroup) {
    if (form.valid) {
      this.activeDossier.updateSymptoms(form.value.items);
      form.markAsPristine();
      return true;
    }
    return false;
  }
}
