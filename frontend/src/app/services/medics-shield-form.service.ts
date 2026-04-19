import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActiveDossierService, MedicsShieldItem, SHIELD_PRESETS } from './active-dossier.service';

@Injectable({
  providedIn: 'root'
})
export class MedicsShieldFormService {
  private fb = inject(FormBuilder);
  private activeDossier = inject(ActiveDossierService);

  createForm(): FormGroup {
    return this.fb.group({
      items: this.fb.array([])
    });
  }

  initForm(form: FormGroup) {
    const shieldsArray = form.get('items') as FormArray;
    shieldsArray.clear();
    const current = this.activeDossier.medicsShields();
    current.forEach(s => {
      shieldsArray.push(this.createShieldFormGroup(s));
    });
  }

  createShieldFormGroup(item?: MedicsShieldItem): FormGroup {
    return this.fb.group({
      id: [item?.id || crypto.randomUUID()],
      label: [item?.label || '', Validators.required],
      emoji: [item?.emoji || '💊']
    });
  }

  addShield(form: FormGroup) {
    const shieldsArray = form.get('items') as FormArray;
    shieldsArray.push(this.createShieldFormGroup());
    form.markAsDirty();
  }

  removeShield(form: FormGroup, index: number) {
    const shieldsArray = form.get('items') as FormArray;
    shieldsArray.removeAt(index);
    form.markAsDirty();
  }

  applyPreset(form: FormGroup, preset: 'reintroduction' | 'desensibilisation') {
    const shieldsArray = form.get('items') as FormArray;
    shieldsArray.clear();
    SHIELD_PRESETS[preset].forEach(s => {
      shieldsArray.push(this.createShieldFormGroup({ ...s, id: crypto.randomUUID() }));
    });
    form.markAsDirty();
  }

  save(form: FormGroup) {
    if (form.valid) {
      this.activeDossier.updateMedicsShields(form.value.items);
      form.markAsPristine();
      return true;
    }
    return false;
  }
}
