import { Component, inject, input, effect, signal, computed } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { DailyFormService } from '../services/daily-form.service';
import { ProtocolService } from '../services/protocol.service';
import { ThemeService } from '../services/theme.service';
import { CopywritingService } from '../services/copywriting.service';
import { GamificationService } from '../services/gamification.service';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, Activity, Check, Pill, Settings, UserPlus, Lock } from 'lucide-angular';
import { Symptom } from '../models/allergy-track.model';
import { SymptomItem } from '../services/protocol.interface';
import { getSymptomEmoji, getTreatmentIcon } from '../utils/allergy.constants';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, DatePipe, NgClass, LucideAngularModule],
  template: `
    <div [ngClass]="theme.cardClass()" class="p-6 sm:p-8">
      
      <!-- Empty State / Reader State -->
      @if (isEmptyState()) {
        <div class="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div class="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
            <lucide-icon [img]="isEmptyReader() ? Lock : ActivityIcon" [size]="48"></lucide-icon>
          </div>
          
          <div class="max-w-xs space-y-2">
            <h2 class="text-xl font-black text-slate-800">
              {{ isEmptyReader() ? 'Mode Lecture Seule' : 'Protocole Inactif' }}
            </h2>
            <p class="text-slate-500 font-bold text-sm">
              {{ isEmptyReader() ? 'Tu consultes ce dossier en tant qu\\'observateur. La saisie n\\'est pas autorisée.' : 'Ce profil n\\'a pas encore de protocole quotidien configuré.' }}
            </p>
          </div>

          @if (!isEmptyReader()) {
            <div class="flex flex-col w-full gap-3">
              <button (click)="goToSettings()" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3">
                <lucide-icon [img]="Settings" [size]="20"></lucide-icon>
                Configurer mon protocole
              </button>
              <button (click)="openContextSwitcher()" class="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-3">
                <lucide-icon [img]="UserPlus" [size]="20"></lucide-icon>
                Inviter un patient
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 class="text-2xl font-black flex items-center gap-3 text-[var(--color-primary)]">
            <span class="text-3xl">📅</span> Journal de {{ auth.activeProfile()?.name }} ({{ date() | date:'dd/MM/yyyy' }})
          </h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="save()">
          
          @if (form.disabled) {
            <div class="mb-8 p-4 bg-slate-100 text-slate-500 rounded-2xl flex flex-col gap-2 font-medium border-2 border-slate-200">
              @if (isBeforeProtocol()) {
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🛑</span>
                  <span>Ce jour est avant le début de ton protocole ({{ protocolService.protocolStartDate() | date:'dd/MM/yyyy' }}).</span>
                </div>
                <div class="text-xs text-slate-400 pl-11">Tu peux modifier la date de début dans les Paramètres.</div>
              } @else {
                <div class="flex items-center gap-3">
                  <span class="text-2xl">⏳</span>
                  <span>On ne peut pas encore remplir le futur ! Reviens plus tard.</span>
                </div>
              }
            </div>
          }

          <!-- Intakes -->
          <div class="mb-8" [ngClass]="theme.protocolSection()">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-focus)]">
              {{ copy.protocolsTitle() }}
            </h3>
            <div formArrayName="intakes" class="space-y-3">
              @if (intakes.length === 0) {
                <div class="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center gap-3 text-slate-500 font-bold">
                  <span class="text-2xl">🏖️</span> Aucun allergène au programme aujourd'hui. Profite bien !
                </div>
              }
              @for (intake of intakes.controls; track $index) {
                <div [formGroupName]="$index" class="relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all hover:shadow-md border border-slate-100/50">
                  <div class="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-md bg-[var(--color-primary)]"></div>
                  <div class="flex items-center gap-4 pl-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
                      <lucide-icon [img]="ActivityIcon" [size]="20" [strokeWidth]="2.5"></lucide-icon>
                    </div>
                    <div class="flex flex-col flex-1">
                      <span class="font-bold text-[var(--color-text)] transition-all">{{ intake.get('allergen')?.value }}</span>
                      <div class="flex items-center gap-2 mt-1">
                        <input type="number" formControlName="dose" class="w-14 p-1 text-center font-bold border-none bg-slate-100 rounded-md text-xs text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary-focus)] focus:outline-none transition-opacity" step="0.5" min="0">
                        <span class="text-xs text-[var(--color-text-muted)] font-medium">Mesure</span>
                      </div>
                    </div>
                  </div>
                  <!-- Animated Checkbox (intake) -->
                  <button type="button" class="check-btn ml-3 shrink-0 w-10 h-10"
                          [disabled]="form.disabled"
                          [class.opacity-50]="form.disabled"
                          (click)="toggleIntake($index)">
                    <div class="check-sparkle" [class.burst]="intakeBurst[$index]"></div>
                    <div class="check-ring w-10 h-10"
                         [class.is-checked]="intake.get('taken')?.value"
                         [class.is-unchecked]="intakeUnchecked[$index]"
                         [style.background-color]="intake.get('taken')?.value ? 'var(--color-primary)' : '#f8fafc'"
                         [style.border-color]="intake.get('taken')?.value ? 'var(--color-primary)' : '#cbd5e1'"
                         [style.color]="intake.get('taken')?.value ? 'white' : 'transparent'">
                      <lucide-icon [img]="Check" [size]="20" [strokeWidth]="3.5"></lucide-icon>
                    </div>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Symptoms -->
          <div class="mb-8" [ngClass]="theme.symptomSection()">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-focus)]">
              {{ copy.symptomsTitle() }}
            </h3>
            <div class="flex flex-wrap gap-3">
              @for (symptom of availableSymptoms(); track symptom.id) {
                <!-- Chips approach for symptoms -->
                <button 
                  type="button"
                  (click)="toggleSymptom(symptom.label)"
                  [disabled]="form.disabled"
                  class="relative overflow-hidden pl-6 pr-5 py-3 rounded-2xl text-sm font-bold transition-all transform hover:-translate-y-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                  [class.bg-[var(--color-primary)]]="hasSymptom(symptom.label)"
                  [class.text-white]="hasSymptom(symptom.label)"
                  [class.shadow-md]="hasSymptom(symptom.label)"
                  [class.-translate-y-1]="hasSymptom(symptom.label)"
                  [class.bg-white]="!hasSymptom(symptom.label)"
                  [class.text-[var(--color-text)]]="!hasSymptom(symptom.label)"
                >
                  <!-- Left colored edge -->
                  <div class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md transition-colors"
                       [ngClass]="hasSymptom(symptom.label) ? 'bg-white/40' : 'bg-orange-400'"></div>
                  <span class="mr-1 relative z-10">{{ symptom.emoji || getSymptomEmoji(symptom.label) }}</span>
                  <span class="relative z-10">{{ symptom.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Treatments -->
          <div class="mb-8" [ngClass]="theme.treatmentSection()">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-focus)]">
              {{ copy.treatmentsTitle() }}
            </h3>
            <div formArrayName="treatments" class="space-y-3">
              @for (treatment of treatments.controls; track $index) {
                <div [formGroupName]="$index" class="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all hover:shadow-md border border-slate-100/50 gap-4">
                  <div class="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-md bg-emerald-400"></div>
                  <div class="flex items-center gap-4 pl-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                      {{ getTreatmentIcon(treatment.get('name')?.value) }}
                    </div>
                    <span class="font-bold text-[var(--color-text)]">{{ treatment.get('name')?.value }}</span>
                  </div>
                  <div class="flex gap-4">
                    <!-- Before -->
                    <button type="button" class="check-btn flex-col gap-1" [disabled]="form.disabled" [class.opacity-50]="form.disabled" (click)="toggleTreatment($index, 'before')">
                      <div class="check-sparkle" [class.burst]="treatmentBurst[$index + '_before']"></div>
                      <div class="check-ring w-8 h-8"
                           [class.is-checked]="treatment.get('before')?.value"
                           [class.is-unchecked]="treatmentUnchecked[$index + '_before']"
                           [style.background-color]="treatment.get('before')?.value ? '#10b981' : '#f8fafc'"
                           [style.border-color]="treatment.get('before')?.value ? '#10b981' : '#cbd5e1'"
                           [style.color]="treatment.get('before')?.value ? 'white' : 'transparent'">
                        <lucide-icon [img]="Check" [size]="16" [strokeWidth]="3.5"></lucide-icon>
                      </div>
                      <span class="text-xs font-bold text-slate-500">Avant</span>
                    </button>
                    <!-- After -->
                    <button type="button" class="check-btn flex-col gap-1" [disabled]="form.disabled" [class.opacity-50]="form.disabled" (click)="toggleTreatment($index, 'after')">
                      <div class="check-sparkle" [class.burst]="treatmentBurst[$index + '_after']"></div>
                      <div class="check-ring w-8 h-8"
                           [class.is-checked]="treatment.get('after')?.value"
                           [class.is-unchecked]="treatmentUnchecked[$index + '_after']"
                           [style.background-color]="treatment.get('after')?.value ? '#10b981' : '#f8fafc'"
                           [style.border-color]="treatment.get('after')?.value ? '#10b981' : '#cbd5e1'"
                           [style.color]="treatment.get('after')?.value ? 'white' : 'transparent'">
                        <lucide-icon [img]="Check" [size]="16" [strokeWidth]="3.5"></lucide-icon>
                      </div>
                      <span class="text-xs font-bold text-slate-500">Après</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-8" [ngClass]="theme.noteSection()">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-focus)]">
              {{ copy.noteTitle() }}
            </h3>
            <div class="relative overflow-hidden rounded-2xl shadow-sm bg-white max-w-full hover:shadow-md transition-shadow">
              <div class="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-md bg-amber-400"></div>
              <textarea 
                formControlName="note" 
                rows="3" 
                class="w-full p-4 pl-6 border-none bg-transparent focus:ring-0 transition-all resize-none disabled:opacity-50 font-medium text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none"
                placeholder="Raconte ta journée, une victoire, une remarque..."></textarea>
            </div>
          </div>

          <div class="sticky bottom-[80px] md:bottom-4 z-50 mt-8">
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
      }
    </div>
  `
})
export class DailyEntryComponent {
  date = input.required<string>();

  private formService = inject(DailyFormService);
  auth = inject(AuthService);
  protocolService = inject(ProtocolService);
  theme = inject(ThemeService);
  copy = inject(CopywritingService);
  gamification = inject(GamificationService);

  form: FormGroup = this.formService.createForm();
  saveSuccess = signal(false);
  saveError = signal<string | null>(null);
  submitAttempted = signal(false);

  isEmptyReader = computed(() => this.auth.activePermission() === 'reader');
  
  isEmptyState = computed(() => {
    if (this.isEmptyReader()) return false; // Show form even if empty for reader (disabled)
    return this.protocolService.protocols().length === 0;
  });

  // Animation state for intake checkboxes
  intakeBurst: Record<number, boolean> = {};
  intakeUnchecked: Record<number, boolean> = {};
  treatmentBurst: Record<string, boolean> = {};
  treatmentUnchecked: Record<string, boolean> = {};

  private triggerAnimation(burstMap: Record<string|number, boolean>, uncheckedMap: Record<string|number, boolean>, key: string|number, isNowChecked: boolean) {
    if (isNowChecked) {
      burstMap[key] = false;
      uncheckedMap[key] = false;
      setTimeout(() => { burstMap[key] = true; }, 10);
    } else {
      burstMap[key] = false;
      uncheckedMap[key] = false;
      setTimeout(() => { uncheckedMap[key] = true; }, 10);
    }
    setTimeout(() => { burstMap[key] = false; uncheckedMap[key] = false; }, 600);
  }

  availableSymptoms = computed<SymptomItem[]>(() => {
    const rienItem: SymptomItem = { id: 'rien', label: 'Rien', emoji: '😎' };
    return [rienItem, ...this.protocolService.symptoms()];
  });

  isBeforeProtocol = computed(() => {
    const start = this.protocolService.protocolStartDate();
    return start ? this.date() < start : false;
  });

  constructor() {
    effect(() => {
      const activeId = this.auth.activeProfile()?.id;
      if (this.date() && activeId) {
        this.formService.loadLogForDate(this.form, this.date());
        this.saveSuccess.set(false);
        this.saveError.set(null);
        this.submitAttempted.set(false);
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

  getSymptomEmoji = getSymptomEmoji;
  getTreatmentIcon = getTreatmentIcon;

  toggleIntake(index: number) {
    if (this.form.disabled) return;
    const control = this.intakes.at(index).get('taken');
    if (!control) return;
    const newValue = !control.value;
    control.setValue(newValue);
    this.intakes.at(index).markAsDirty();
    this.triggerAnimation(this.intakeBurst, this.intakeUnchecked, index, newValue);
  }

  toggleTreatment(index: number, field: 'before' | 'after') {
    if (this.form.disabled) return;
    const control = this.treatments.at(index).get(field);
    if (!control) return;
    const newValue = !control.value;
    control.setValue(newValue);
    this.treatments.at(index).markAsDirty();
    const key = `${index}_${field}`;
    this.triggerAnimation(this.treatmentBurst, this.treatmentUnchecked, key, newValue);
  }

  save() {
    this.submitAttempted.set(true);
    if (this.form.invalid) return;
    this.formService.saveLog(this.form).subscribe({
      next: () => {
        this.saveSuccess.set(true);
        this.saveError.set(null);
        this.gamification.refresh();
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde:', err);
        this.saveError.set("Impossible d'enregistrer ta journée. Vérifie ta connexion !");
        setTimeout(() => this.saveError.set(null), 5000);
      }
    });
  }

  goToSettings() {
    // This logic should be in App component to change activeTab signal
    // For now we can inject App if possible or use a shared service
    // But since it's a prototype, let's just trigger a redirect via a service or a window event
    (window as any).dispatchTabChange?.('preferences');
  }

  openContextSwitcher() {
    // This is purely for UX, maybe scroll to top or open dropdown
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readonly ActivityIcon = Activity;
  readonly Check = Check;
  readonly Pill = Pill;
  readonly Settings = Settings;
  readonly UserPlus = UserPlus;
  readonly Lock = Lock;
  readonly Activity = Activity;
}
