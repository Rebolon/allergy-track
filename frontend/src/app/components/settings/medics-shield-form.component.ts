import { Component, inject, OnInit, effect, signal, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { LucideAngularModule, Trash2, Plus } from 'lucide-angular';
import { MedicsShieldFormService } from '../../services/medics-shield-form.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-medics-shield-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <section class="space-y-6 text-left">
      @if (!onboardingMode()) {
        <span class="block text-sm font-black mb-4 uppercase text-slate-400 tracking-widest">Boucliers Magiques (Médicaments)</span>
      }
      
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
          @for (item of shieldsArray.controls; track item.get('id')?.value; let i = $index) {
            <div [formGroupName]="i" class="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
              <input type="text" formControlName="emoji" class="w-12 p-2 text-center text-xl bg-slate-50 rounded-lg outline-none" placeholder="💊">
              <input type="text" formControlName="label" class="flex-1 p-2 font-bold bg-slate-50 rounded-lg outline-none" placeholder="Nom du médicament">
              <button type="button" (click)="remove(i)" class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                <lucide-icon [img]="Trash2" [size]="20"></lucide-icon>
              </button>
            </div>
          }
        </div>

        <button type="button" (click)="add()" class="w-full py-3 mb-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
          <lucide-icon [img]="Plus" [size]="18"></lucide-icon> Ajouter un médicament
        </button>

        <button type="submit" [disabled]="form.invalid || (!form.dirty && !onboardingMode())" 
                class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
          {{ onboardingMode() ? 'Continuer' : 'Enregistrer les boucliers' }}
        </button>

        @if (saveSuccess() && !onboardingMode()) {
          <p class="mt-3 text-center text-emerald-600 font-black animate-bounce text-sm">✅ Boucliers mis à jour !</p>
        }
      </form>
    </section>
  `
})
export class MedicsShieldFormComponent implements OnInit {
  private medicsShieldFormService = inject(MedicsShieldFormService);
  private auth = inject(AuthService);

  onboardingMode = input<boolean>(false);
  saved = output<void>();

  form: FormGroup = this.medicsShieldFormService.createForm();
  saveSuccess = signal(false);

  constructor() {
    effect(() => {
      if (this.auth.activeProfile()) {
        this.medicsShieldFormService.initForm(this.form);
      }
    });
  }

  ngOnInit() {
    this.medicsShieldFormService.initForm(this.form);
  }

  get shieldsArray() {
    return this.form.get('items') as FormArray;
  }

  add() {
    this.medicsShieldFormService.addShield(this.form);
  }

  remove(index: number) {
    this.medicsShieldFormService.removeShield(this.form, index);
  }

  applyPreset(preset: 'reintroduction' | 'desensibilisation') {
    this.medicsShieldFormService.applyPreset(this.form, preset);
  }

  save() {
    if (this.medicsShieldFormService.save(this.form)) {
      this.saveSuccess.set(true);
      this.saved.emit();
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }
  }

  readonly Trash2 = Trash2;
  readonly Plus = Plus;
}
