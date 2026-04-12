import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { LucideAngularModule, Trash2, Plus } from 'lucide-angular';
import { SymptomFormService } from '../../services/symptom-form.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-symptom-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <section class="space-y-6">
      <span class="block text-sm font-black mb-4 uppercase text-slate-400 tracking-widest">Symptômes Configurables</span>
      
      <div class="flex flex-wrap gap-2 mb-6">
        <button type="button" (click)="applyPreset('reintroduction')" class="px-4 py-2 rounded-xl border-2 border-violet-100 bg-white text-violet-600 font-bold text-xs hover:border-violet-200 transition-all">
          🍽️ Réintroduction
        </button>
        <button type="button" (click)="applyPreset('desensibilisation')" class="px-4 py-2 rounded-xl border-2 border-blue-100 bg-white text-blue-600 font-bold text-xs hover:border-blue-200 transition-all">
          💉 Désensibilisation
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">
        <div formArrayName="items" class="space-y-3 mb-4">
          <!-- Fixed 'Rien' row -->
          <div class="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 opacity-60">
            <span class="text-2xl">😎</span>
            <span class="font-bold text-slate-600 flex-1">Rien (Toujours présent)</span>
          </div>

          @for (item of symptomsArray.controls; track item.get('id')?.value; let i = $index) {
            <div [formGroupName]="i" class="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
              <input type="text" formControlName="emoji" class="w-12 p-2 text-center text-xl bg-slate-50 rounded-lg outline-none" placeholder="🤔">
              <input type="text" formControlName="label" class="flex-1 p-2 font-bold bg-slate-50 rounded-lg outline-none" placeholder="Symptôme">
              <button type="button" (click)="remove(i)" class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                <lucide-icon [img]="Trash2" [size]="20"></lucide-icon>
              </button>
            </div>
          }
        </div>

        <button type="button" (click)="add()" class="w-full py-3 mb-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
          <lucide-icon [img]="Plus" [size]="18"></lucide-icon> Ajouter un symptôme
        </button>

        <button type="submit" [disabled]="form.invalid || !form.dirty" 
                class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
          Enregistrer les symptômes
        </button>

        @if (saveSuccess()) {
          <p class="mt-3 text-center text-emerald-600 font-black animate-bounce text-sm">✅ Symptômes mis à jour !</p>
        }
      </form>
    </section>
  `
})
export class SymptomFormComponent implements OnInit {
  private symptomFormService = inject(SymptomFormService);
  private auth = inject(AuthService);

  form: FormGroup = this.symptomFormService.createForm();
  saveSuccess = signal(false);

  constructor() {
    effect(() => {
      if (this.auth.activeProfile()) {
        this.symptomFormService.initForm(this.form);
      }
    });
  }

  ngOnInit() {
    this.symptomFormService.initForm(this.form);
  }

  get symptomsArray() {
    return this.form.get('items') as FormArray;
  }

  add() {
    this.symptomFormService.addSymptom(this.form);
  }

  remove(index: number) {
    this.symptomFormService.removeSymptom(this.form, index);
  }

  applyPreset(preset: 'reintroduction' | 'desensibilisation') {
    this.symptomFormService.applyPreset(this.form, preset);
  }

  save() {
    if (this.symptomFormService.save(this.form)) {
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }
  }

  readonly Trash2 = Trash2;
  readonly Plus = Plus;
}
