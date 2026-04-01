import { Component, inject, input, effect, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { DailyFormService } from '../services/daily-form.service';
import { ThemeService } from '../services/theme.service';
import { CopywritingService } from '../services/copywriting.service';
import { GamificationService } from '../services/gamification.service';
import { MatIconModule } from '@angular/material/icon';
import { Symptom } from '../models/allergi-track.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, DatePipe, NgClass],
  template: `
    <div [ngClass]="theme.cardClass()" class="p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 class="text-2xl font-black flex items-center gap-3" [class.text-violet-800]="theme.persona() === 'child'">
          <span class="text-3xl">📅</span> Mon Journal du {{ date() | date:'dd/MM/yyyy' }}
        </h2>

        @if (gState(); as g) {
          <div class="flex flex-col items-end gap-2">
            @if (theme.persona() === 'adult') {
              <div class="flex gap-4">
                <!-- Regular Streak (Flame) -->
                @if (g.regularStreak > 0) {
                  <div class="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xl border-2 shadow-sm bg-white text-slate-800 border-slate-200">
                    🔥 {{ copy.streakTitle() }} {{ g.regularStreak }}
                  </div>
                }
                <!-- Perfect Streak (Star) -->
                @if (g.perfectStreak > 0) {
                  <div class="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xl border-2 shadow-sm bg-white text-slate-800 border-slate-200">
                    ⭐ Parfait {{ g.perfectStreak }}
                  </div>
                }
              </div>
            }
            
            @if (g.showCongratulation) {
              <span class="text-xs font-bold text-orange-500">✨ Suivi régulier, c'est super pour le traitement ! ✨</span>
            }
          </div>
        }
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">
        
        @if (form.disabled) {
          <div class="mb-8 p-4 bg-slate-100 text-slate-500 rounded-2xl flex items-center gap-3 font-medium border-2 border-slate-200">
            <span class="text-2xl">⏳</span>
            On ne peut pas encore remplir le futur ! Reviens plus tard.
          </div>
        }

        @if (gState()?.hasMissedYesterday && gState()?.hasPreviousRecords && gState()?.perfectStreak === 0 && !form.disabled) {
          <div class="mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold border-2"
               [class.bg-rose-100]="theme.persona() === 'child'"
               [class.text-rose-800]="theme.persona() === 'child'"
               [class.border-rose-200]="theme.persona() === 'child'"
               [class.bg-slate-800]="theme.persona() === 'teen'"
               [class.text-rose-400]="theme.persona() === 'teen'"
               [class.border-rose-900]="theme.persona() === 'teen'"
               [class.bg-rose-50]="theme.persona() === 'adult'"
               [class.text-rose-900]="theme.persona() === 'adult'"
               [class.border-rose-200]="theme.persona() === 'adult'">
            <span class="text-2xl">⚠️</span>
            {{ copy.streakBrokenMessage() }}
          </div>
        }

        <!-- Intakes -->
        <div class="mb-8" [ngClass]="theme.protocolSection()">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2" [class.text-emerald-800]="theme.persona() === 'child'">
            {{ copy.protocolsTitle() }}
          </h3>
          <div formArrayName="intakes" class="space-y-3">
            @for (intake of intakes.controls; track $index) {
              <div [formGroupName]="$index" class="flex items-center justify-between p-4 rounded-2xl border-2 bg-white hover:shadow-md transition-all" [class.border-emerald-200]="theme.persona() === 'child'" [class.border-slate-200]="theme.persona() !== 'child'">
                <div class="flex flex-col">
                  <span class="font-bold text-lg" [class.text-emerald-900]="theme.persona() === 'child'" [class.text-slate-800]="theme.persona() !== 'child'">{{ intake.get('allergen')?.value }}</span>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm font-medium" [class.text-emerald-600]="theme.persona() === 'child'" [class.text-slate-500]="theme.persona() !== 'child'">Dose:</span>
                    <input type="number" formControlName="dose" class="w-20 p-1.5 text-center font-bold border-2 rounded-xl focus:ring-2 focus:outline-none disabled:opacity-50 disabled:bg-slate-100" [class.text-emerald-900]="theme.persona() === 'child'" [class.border-emerald-100]="theme.persona() === 'child'" [class.bg-emerald-50]="theme.persona() === 'child'" [class.focus:ring-emerald-400]="theme.persona() === 'child'" [class.text-slate-800]="theme.persona() !== 'child'" [class.border-slate-200]="theme.persona() !== 'child'" [class.bg-slate-50]="theme.persona() !== 'child'" [class.focus:ring-slate-400]="theme.persona() !== 'child'" step="0.5" min="0">
                  </div>
                </div>
                <label class="relative inline-flex items-center" [class.cursor-pointer]="!form.disabled" [class.cursor-not-allowed]="form.disabled">
                  <input type="checkbox" formControlName="taken" class="sr-only peer">
                  <div class="w-14 h-8 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-disabled:opacity-50 peer-disabled:cursor-not-allowed shadow-inner" [class.bg-emerald-100]="theme.persona() === 'child'" [class.peer-checked:bg-emerald-500]="theme.persona() === 'child'" [class.after:border-emerald-200]="theme.persona() === 'child'" [class.bg-slate-200]="theme.persona() !== 'child'" [class.peer-checked:bg-blue-600]="theme.persona() !== 'child'" [class.after:border-slate-300]="theme.persona() !== 'child'"></div>
                </label>
              </div>
            }
          </div>
        </div>

        <!-- Symptoms -->
        <div class="mb-8" [ngClass]="theme.symptomSection()">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2" [class.text-amber-800]="theme.persona() === 'child'">
            {{ copy.symptomsTitle() }}
          </h3>
          <div class="flex flex-wrap gap-3">
            @for (symptom of availableSymptoms; track symptom) {
              <button 
                type="button"
                (click)="toggleSymptom(symptom)"
                [disabled]="form.disabled"
                class="px-5 py-3 rounded-2xl text-sm font-bold transition-all transform hover:-translate-y-1 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-none border-2"
                [class.bg-amber-400]="hasSymptom(symptom) && theme.persona() === 'child'"
                [class.text-amber-900]="hasSymptom(symptom) && theme.persona() === 'child'"
                [class.border-amber-500]="hasSymptom(symptom) && theme.persona() === 'child'"
                [class.border-b-4]="hasSymptom(symptom) && theme.persona() === 'child'"
                [class.bg-white]="!hasSymptom(symptom) && theme.persona() === 'child'"
                [class.text-amber-700]="!hasSymptom(symptom) && theme.persona() === 'child'"
                [class.border-amber-200]="!hasSymptom(symptom) && theme.persona() === 'child'"
                
                [class.bg-blue-600]="hasSymptom(symptom) && theme.persona() !== 'child'"
                [class.text-white]="hasSymptom(symptom) && theme.persona() !== 'child'"
                [class.border-blue-700]="hasSymptom(symptom) && theme.persona() !== 'child'"
                [class.bg-white]="!hasSymptom(symptom) && theme.persona() !== 'child'"
                [class.text-slate-700]="!hasSymptom(symptom) && theme.persona() !== 'child'"
                [class.border-slate-200]="!hasSymptom(symptom) && theme.persona() !== 'child'"
              >
                {{ getSymptomEmoji(symptom) }} {{ symptom }}
              </button>
            }
          </div>
        </div>

        <!-- Treatments -->
        <div class="mb-8" [ngClass]="theme.treatmentSection()">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2" [class.text-rose-800]="theme.persona() === 'child'">
            {{ copy.treatmentsTitle() }}
          </h3>
          <div formArrayName="treatments" class="space-y-3">
            @for (treatment of treatments.controls; track $index) {
              <div [formGroupName]="$index" class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border-2 bg-white hover:shadow-md transition-all gap-4" [class.border-rose-200]="theme.persona() === 'child'" [class.border-slate-200]="theme.persona() !== 'child'">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl" [class.bg-rose-100]="theme.persona() === 'child'" [class.bg-slate-100]="theme.persona() !== 'child'">
                    {{ getTreatmentIcon(treatment.get('name')?.value) }}
                  </div>
                  <span class="font-bold text-lg" [class.text-rose-900]="theme.persona() === 'child'" [class.text-slate-800]="theme.persona() !== 'child'">{{ treatment.get('name')?.value }}</span>
                </div>
                <div class="flex gap-4 p-3 rounded-xl border" [class.bg-rose-50]="theme.persona() === 'child'" [class.border-rose-100]="theme.persona() === 'child'" [class.bg-slate-50]="theme.persona() !== 'child'" [class.border-slate-200]="theme.persona() !== 'child'">
                  <label class="flex items-center gap-2" [class.cursor-pointer]="!form.disabled" [class.cursor-not-allowed]="form.disabled">
                    <input type="checkbox" formControlName="before" class="w-5 h-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" [class.text-rose-500]="theme.persona() === 'child'" [class.border-rose-300]="theme.persona() === 'child'" [class.focus:ring-rose-500]="theme.persona() === 'child'" [class.text-blue-600]="theme.persona() !== 'child'" [class.border-slate-300]="theme.persona() !== 'child'" [class.focus:ring-blue-500]="theme.persona() !== 'child'">
                    <span class="text-sm font-bold" [class.text-rose-700]="theme.persona() === 'child'" [class.text-slate-700]="theme.persona() !== 'child'">Avant</span>
                  </label>
                  <label class="flex items-center gap-2" [class.cursor-pointer]="!form.disabled" [class.cursor-not-allowed]="form.disabled">
                    <input type="checkbox" formControlName="after" class="w-5 h-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" [class.text-rose-500]="theme.persona() === 'child'" [class.border-rose-300]="theme.persona() === 'child'" [class.focus:ring-rose-500]="theme.persona() === 'child'" [class.text-blue-600]="theme.persona() !== 'child'" [class.border-slate-300]="theme.persona() !== 'child'" [class.focus:ring-blue-500]="theme.persona() !== 'child'">
                    <span class="text-sm font-bold" [class.text-rose-700]="theme.persona() === 'child'" [class.text-slate-700]="theme.persona() !== 'child'">Après</span>
                  </label>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-8" [ngClass]="theme.noteSection()">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2" [class.text-sky-800]="theme.persona() === 'child'">
            {{ copy.noteTitle() }}
          </h3>
          <textarea 
            formControlName="note" 
            rows="3" 
            class="w-full p-4 rounded-2xl border-2 bg-white focus:bg-white focus:ring-4 transition-all resize-none disabled:opacity-50 disabled:bg-slate-50 font-medium"
            [class.border-sky-200]="theme.persona() === 'child'"
            [class.focus:ring-sky-100]="theme.persona() === 'child'"
            [class.focus:border-sky-400]="theme.persona() === 'child'"
            [class.text-sky-900]="theme.persona() === 'child'"
            [class.placeholder:text-sky-300]="theme.persona() === 'child'"
            [class.border-slate-200]="theme.persona() !== 'child'"
            [class.focus:ring-slate-100]="theme.persona() !== 'child'"
            [class.focus:border-slate-400]="theme.persona() !== 'child'"
            [class.text-slate-800]="theme.persona() !== 'child'"
            [class.placeholder:text-slate-400]="theme.persona() !== 'child'"
            placeholder="Raconte ta journée, une victoire, une remarque..."></textarea>
        </div>

        <div class="sticky bottom-4 z-50 mt-8">
          @if (form.invalid && !form.disabled && submitAttempted()) {
            <div class="mb-2 text-center text-sm font-bold text-rose-600 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-xl shadow-sm border border-rose-100 mx-auto w-full">
              ⚠️ Veuillez cocher au moins un protocole et un symptôme pour valider.
            </div>
          }
          <button 
            type="submit" 
            [disabled]="form.disabled"
            class="w-full py-4 px-6 text-lg font-black transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl"
            [ngClass]="theme.primaryButton()"
          >
            {{ copy.saveButton() }}
          </button>
          
          @if (saveSuccess()) {
            <div class="absolute -top-16 left-0 right-0 p-4 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 font-bold rounded-2xl flex items-center justify-center gap-3 text-lg animate-bounce shadow-lg">
              {{ copy.successMessage() }}
            </div>
          }
        </div>
        
        @if (saveError()) {
          <div class="mt-6 p-4 bg-rose-100 border-2 border-rose-400 text-rose-800 font-bold rounded-2xl flex items-center justify-center gap-3 text-lg animate-shake">
            <span>⚠️</span>
            Oups ! {{ saveError() }}
          </div>
        }
      </form>
    </div>
  `
})
export class DailyEntryComponent {
  date = input.required<string>();

  private formService = inject(DailyFormService);
  theme = inject(ThemeService);
  copy = inject(CopywritingService);
  gamification = inject(GamificationService);

  form: FormGroup = this.formService.createForm();
  saveSuccess = signal(false);
  saveError = signal<string | null>(null);
  submitAttempted = signal(false);

  gState = toSignal(this.gamification.getGamificationState().pipe(startWith(null)));

  availableSymptoms: Symptom[] = ['Rien', 'Démangeaisons bouche', 'Respiratoire', 'Abdominal', 'Autres'];

  constructor() {
    effect(() => {
      if (this.date()) {
        this.formService.loadLogForDate(this.form, this.date());
        this.saveSuccess.set(false);
        this.saveError.set(null);
        this.submitAttempted.set(false);
        // Force refresh of gamification state
        this.gamification.refresh();
      }
    });
  }

  get intakes() {
    return this.form.get('intakes') as FormArray;
  }

  get symptoms() {
    return this.form.get('symptoms') as FormArray;
  }

  get treatments() {
    return this.form.get('treatments') as FormArray;
  }

  hasSymptom(symptom: string): boolean {
    return this.symptoms.value.includes(symptom);
  }

  toggleSymptom(symptom: string) {
    if (this.form.disabled) return;

    const current = this.symptoms.value as string[];

    if (symptom === 'Rien') {
      if (current.includes('Rien')) {
        this.symptoms.clear();
      } else {
        this.symptoms.clear();
        this.symptoms.push(new FormControl('Rien'));
      }
      this.form.markAsDirty();
      return;
    }

    if (current.includes('Rien')) {
      this.symptoms.clear();
    }

    const index = this.symptoms.controls.findIndex(c => c.value === symptom);
    if (index >= 0) {
      this.symptoms.removeAt(index);
    } else {
      this.symptoms.push(new FormControl(symptom));
    }
    
    this.form.markAsDirty();
  }

  getSymptomEmoji(symptom: string): string {
    switch (symptom) {
      case 'Rien': return '😎';
      case 'Démangeaisons bouche': return '👄';
      case 'Respiratoire': return '🫁';
      case 'Abdominal': return '🤢';
      case 'Autres': return '🤔';
      default: return '🤒';
    }
  }

  getTreatmentIcon(name: string): string {
    switch (name) {
      case 'Antihistaminique': return '💊';
      case 'Aerius/Aeromire': return '💨';
      case 'Adrénaline': return '💉';
      default: return '💊';
    }
  }

  save() {
    this.submitAttempted.set(true);
    
    // Empêcher la sauvegarde si le formulaire est invalide
    if (this.form.invalid) return;

    this.formService.saveLog(this.form).subscribe({
      next: () => {
        this.saveSuccess.set(true);
        this.saveError.set(null);
        // We trigger refresh which recalculates
        this.gamification.refresh();
        // And we check for celebration manually via subscription if needed,
        // Since getGamificationState exposes an observable, we'll let check happen.
        const currentState = this.gState();
        if (currentState) {
           this.gamification.checkAndCelebrate(currentState);
        }
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde:', err);
        this.saveError.set("Impossible d'enregistrer ta journée. Vérifie ta connexion !");
        setTimeout(() => this.saveError.set(null), 5000);
      }
    });
  }
}
