import { Component, inject, OnInit, effect, signal, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { LucideAngularModule, Trash2, Plus, Calendar } from 'lucide-angular';
import { ProtocolFormService } from '../../services/protocol-form.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-protocol-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, NgClass],
  template: `
    <section [ngClass]="theme.protocolSection()" class="space-y-6">
      @if (!onboardingMode()) {
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">🥨</span>
          <h3 class="text-xl font-black text-[var(--color-primary-focus)]">Défis gourmands</h3>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="save()">
        <!-- Start Date Block -->
        <div class="relative overflow-hidden mb-6 p-4 rounded-2xl bg-white shadow-sm border border-slate-100/50 flex flex-col gap-2">
          <div class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md bg-[var(--color-primary)]"></div>
          <label class="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-3">
            <lucide-icon [img]="Calendar" [size]="14"></lucide-icon>
            Date de début du protocole
          </label>
          <input type="date" formControlName="startDate" 
                 class="ml-3 p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 focus:ring-[var(--color-primary-focus)] transition-all">
        </div>

        <!-- Protocol Items -->
        <div formArrayName="items" class="space-y-3 mb-6">
          @for (item of protocolsArray.controls; track item.get('id')?.value; let i = $index) {
            <div [formGroupName]="i" class="relative overflow-hidden flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100/50">
              <div class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md bg-[var(--color-primary)]"></div>
              
              <div class="flex-1 w-full pl-3">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Allergène</label>
                <input type="text" formControlName="allergen" 
                       class="w-full p-3 font-bold bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-[var(--color-primary-focus)]" 
                       placeholder="Ex: Noisette">
              </div>

              <div class="flex gap-3 w-full sm:w-auto">
                <div class="flex flex-col flex-1 sm:w-24">
                   <label class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1">Dose (u)</label>
                   <input type="number" step="0.1" formControlName="dose" 
                          class="w-full p-3 font-bold bg-slate-50 rounded-xl border-none outline-none text-center focus:ring-2 focus:ring-[var(--color-primary-focus)]" 
                          placeholder="0.0">
                </div>
                <div class="flex flex-col flex-1 sm:w-24">
                   <label class="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1">Fréq (j)</label>
                   <input type="number" formControlName="frequencyDays" 
                          class="w-full p-3 font-bold bg-slate-50 rounded-xl border-none outline-none text-center focus:ring-2 focus:ring-[var(--color-primary-focus)]" 
                          title="Tous les X jours">
                </div>
                <button type="button" (click)="remove(i)" 
                        class="p-3 text-rose-500 hover:bg-rose-50 rounded-xl self-end transition-colors mb-0.5">
                  <lucide-icon [img]="Trash2" [size]="20"></lucide-icon>
                </button>
              </div>
            </div>
          }
        </div>

        <button type="button" (click)="add()" 
                class="w-full py-4 mb-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary-focus)] transition-all flex items-center justify-center gap-2 bg-white/50">
          <lucide-icon [img]="Plus" [size]="18"></lucide-icon> Ajouter un défi
        </button>

        <button type="submit" [disabled]="form.invalid || (!form.dirty && !onboardingMode())" 
                class="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-black text-lg shadow-lg hover:bg-[var(--color-primary-focus)] transition-all disabled:opacity-50 transform active:scale-95">
          {{ onboardingMode() ? 'Continuer' : 'Enregistrer le protocole' }}
        </button>
        
        @if (saveSuccess() && !onboardingMode()) {
          <p class="mt-4 text-center text-emerald-600 font-black animate-bounce text-sm flex items-center justify-center gap-2">
            <span>✅</span> Protocole mis à jour !
          </p>
        }
      </form>
    </section>
  `
})
export class ProtocolFormComponent implements OnInit {
  private protocolFormService = inject(ProtocolFormService);
  private auth = inject(AuthService);
  theme = inject(ThemeService);
  
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
  readonly Calendar = Calendar;
}

