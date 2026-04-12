import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActiveDossierService, ProtocolItem } from './active-dossier.service';

@Injectable({
  providedIn: 'root'
})
export class ProtocolFormService {
  private fb = inject(FormBuilder);
  private activeDossier = inject(ActiveDossierService);

  createForm(): FormGroup {
    return this.fb.group({
      startDate: ['', Validators.required],
      items: this.fb.array([])
    });
  }

  initForm(form: FormGroup) {
    const protocolsArray = form.get('items') as FormArray;
    protocolsArray.clear();
    const currentProtocols = this.activeDossier.protocols();
    const startDate = this.activeDossier.protocolStartDate() || '';

    form.patchValue({ startDate });
    currentProtocols.forEach(p => {
      protocolsArray.push(this.createProtocolFormGroup(p));
    });
  }

  createProtocolFormGroup(item?: ProtocolItem): FormGroup {
    return this.fb.group({
      id: [item?.id || crypto.randomUUID()],
      allergen: [item?.allergen || '', Validators.required],
      dose: [item?.dose ?? 1.5, [Validators.required, Validators.min(0)]],
      frequencyDays: [item?.frequencyDays || 1, [Validators.required, Validators.min(1)]],
      createdAt: [item?.createdAt || new Date().toISOString().split('T')[0]]
    });
  }

  addProtocol(form: FormGroup) {
    const protocolsArray = form.get('items') as FormArray;
    protocolsArray.push(this.createProtocolFormGroup());
    form.markAsDirty();
  }

  removeProtocol(form: FormGroup, index: number) {
    const protocolsArray = form.get('items') as FormArray;
    protocolsArray.removeAt(index);
    form.markAsDirty();
  }

  save(form: FormGroup) {
    if (form.valid) {
      this.activeDossier.updateProtocols(form.value.items);
      this.activeDossier.updateStartDate(form.value.startDate);
      form.markAsPristine();
      return true;
    }
    return false;
  }
}
