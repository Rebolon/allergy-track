import { Component, inject, OnInit, effect, signal, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { LucideAngularModule, Trash2, Plus, Zap } from 'lucide-angular';
import { SymptomFormService } from '../../services/symptom-form.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-symptom-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, NgClass],
  template: `
    <section [ngClass]="theme.symptomSection()" class="space-y-6 text-left">
      @if (!onboardingMode()) {
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">⚡</span>
          <h3 class="text-xl font-black text-[var(--color-primary-focus)]">Comment je me sens</h3>
        </div>
      }
      
      @if (!onboardingMode()) {
        <div class="flex flex-wrap gap-2 mb-4">
          <button type="button" (click)="applyPreset('reintroduction')" class="px-4 py-2 rounded-xl border-2 border-violet-100 bg-white text-violet-600 font-bold text-xs hover:border-violet-200 transition-all">
            🍽️ Réintroduction
          </button>
          <button type="button" (click)="applyPreset('desensibilisation')" class="px-4 py-2 rounded-xl border-2 border-blue-100 bg-white text-blue-600 font-bold text-xs hover:border-blue-200 transition-all">
            💉 Désensibilisation
          </button>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="save()">
        <div formArrayName="items" class="space-y-3 mb-6">
          <!-- Fixed 'Rien' row -->
          <div class="relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl border border-slate-100/50 bg-white shadow-sm opacity-60">
            <div class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md bg-emerald-400"></div>
            <span class="text-2xl pl-3">😎</span>
            <span class="font-bold text-slate-600 flex-1">Rien (Toujours présent)</span>
          </div>

          @for (item of symptomsArray.controls; track item.get('id')?.value; let i = $index) {
            <div [formGroupName]="i" class="relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-slate-100/50">
              <div class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md bg-orange-400"></div>
              
              <input type="text" formControlName="emoji" 
                     class="ml-3 w-12 p-3 text-center text-xl bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-[var(--color-primary-focus)]" 
                     placeholder="🤔">
              <input type="text" formControlName="label" 
                     class="flex-1 p-3 font-bold bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-[var(--color-primary-focus)]" 
                     placeholder="Symptôme">
              
              <button type="button" (click)="remove(i)" 
                      class="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                <lucide-icon [img]="Trash2" [size]="20"></lucide-icon>
              </button>
            </div>
          }
        </div>

        <button type="button" (click)="add()" 
                class="w-full py-4 mb-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary-focus)] transition-all flex items-center justify-center gap-2 bg-white/50">
          <lucide-icon [img]="Plus" [size]="18"></lucide-icon> Ajouter un symptôme
        </button>

        <button type="submit" [disabled]="form.invalid || (!form.dirty && !onboardingMode())" 
                class="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-black text-lg shadow-lg hover:bg-[var(--color-primary-focus)] transition-all disabled:opacity-50 transform active:scale-95">
          {{ onboardingMode() ? 'Continuer' : 'Enregistrer les symptômes' }}
        </button>

        @if (saveSuccess() && !onboardingMode()) {
          <p class="mt-4 text-center text-emerald-600 font-black animate-bounce text-sm flex items-center justify-center gap-2">
            <span>✅</span> Symptômes mis à jour !
          </p>
        }
      </form>
    </section>
  `
})
export class SymptomFormComponent implements OnInit {
  private symptomFormService = inject(SymptomFormService);
  private auth = inject(AuthService);
  theme = inject(ThemeService);

  onboardingMode = input<boolean>(false);
  saved = output<void>();

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
      this.saved.emit();
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }
  }

  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Zap = Zap;
}

