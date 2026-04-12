import { Component, inject, OnInit, effect, signal, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { LucideAngularModule, Trash2, Plus } from 'lucide-angular';
import { ProtocolFormService } from '../../services/protocol-form.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-protocol-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <section class="space-y-6">
      @if (!onboardingMode()) {
        <span class="block text-sm font-black mb-4 uppercase text-slate-400 tracking-widest">Configuration Protocole</span>
      }
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="mb-6 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex flex-col gap-2">
          <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Date de début</label>
          <input type="date" formControlName="startDate" class="p-3 bg-white rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-emerald-500">
        </div>

        <div formArrayName="items" class="space-y-3 mb-4">
          @for (item of protocolsArray.controls; track item.get('id')?.value; let i = $index) {
            <div [formGroupName]="i" class="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
              <input type="text" formControlName="allergen" class="flex-1 w-full p-2 font-bold bg-slate-50 rounded-lg outline-none" placeholder="Allergène">
              <div class="flex gap-2 w-full sm:w-auto">
                <div class="flex flex-col flex-1 sm:w-20">
                   <label class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1">Dose</label>
                   <input type="number" step="0.1" formControlName="dose" class="w-full p-2 font-bold bg-slate-50 rounded-lg outline-none text-center" placeholder="Dose">
                </div>
                <div class="flex flex-col flex-1 sm:w-20">
                   <label class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1">Fréq (j)</label>
                   <input type="number" formControlName="frequencyDays" class="w-full p-2 font-bold bg-slate-50 rounded-lg outline-none text-center" title="Tous les X jours">
                </div>
                <button type="button" (click)="remove(i)" class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg self-end mb-1">
                  <lucide-icon [img]="Trash2" [size]="20"></lucide-icon>
                </button>
              </div>
            </div>
          }
        </div>

        <button type="button" (click)="add()" class="w-full py-3 mb-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
          <lucide-icon [img]="Plus" [size]="18"></lucide-icon> Ajouter une ligne
        </button>

        <button type="submit" [disabled]="form.invalid || (!form.dirty && !onboardingMode())" 
                class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
          {{ onboardingMode() ? 'Continuer' : 'Enregistrer le protocole' }}
        </button>
        
        @if (saveSuccess() && !onboardingMode()) {
          <p class="mt-3 text-center text-emerald-600 font-black animate-bounce text-sm">✅ Protocole mis à jour !</p>
        }
      </form>
    </section>
  `
})
export class ProtocolFormComponent implements OnInit {
  private protocolFormService = inject(ProtocolFormService);
  private auth = inject(AuthService);
  
  onboardingMode = input<boolean>(false);
  saved = output<void>();

  form: FormGroup = this.protocolFormService.createForm();
  saveSuccess = signal(false);

  constructor() {
    effect(() => {
      if (this.auth.activeProfile()) {
        this.protocolFormService.initForm(this.form);
      }
    });
  }

  ngOnInit() {
    this.protocolFormService.initForm(this.form);
  }

  get protocolsArray() {
    return this.form.get('items') as FormArray;
  }

  add() {
    this.protocolFormService.addProtocol(this.form);
  }

  remove(index: number) {
    this.protocolFormService.removeProtocol(this.form, index);
  }

  save() {
    if (this.protocolFormService.save(this.form)) {
      this.saveSuccess.set(true);
      this.saved.emit();
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }
  }

  readonly Trash2 = Trash2;
  readonly Plus = Plus;
}
