import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, of, switchMap, filter, first } from 'rxjs';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { SharingService } from './sharing.service';
import { ActiveDossierService } from './active-dossier.service';

export type OnboardingStep = 'birthdate' | 'choice' | 'proche_choice' | 'proche_create' | 'proche_join' | 'protocol_type' | 'config_protocol' | 'config_symptoms' | 'config_shields' | 'success_me';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private sharingService = inject(SharingService);
  private activeDossier = inject(ActiveDossierService);
  private router = inject(Router);

  step = signal<OnboardingStep>('birthdate');
  loading = signal(false);
  error = signal<string | null>(null);

  // Form fields as signals
  userBirthDate = signal('1990-01-01');
  procheName = signal('');
  procheBirthDate = signal('2015-01-01');
  inviteCode = signal('');

  constructor() {
    // Resolution 3: Reactive Resume
    // We use toObservable + filter + first instead of a persistent effect
    // because we only want to resume once at startup.
    toObservable(this.auth.activeProfile).pipe(
      filter(profile => !!profile),
      first()
    ).subscribe(() => {
      this.checkResumeStatus();
    });
  }

  init() {
    this.checkResumeStatus();
  }

  private checkResumeStatus() {
    const active = this.auth.activeProfile();
    if (active && active.onboardingStep) {
      switch (active.onboardingStep) {
        case 'choice': this.step.set('choice'); break;
        case 'protocol': this.step.set('config_protocol'); break;
        case 'symptoms': this.step.set('config_symptoms'); break;
        case 'shields': this.step.set('config_shields'); break;
        case 'completed': this.router.navigate(['/home']); break;
      }
    }
  }

  private updateOnboardingStep(nextStep: string): Observable<void> {
    const active = this.auth.activeProfile();
    if (active) {
      return this.auth.updateProfile({ ...active, onboardingStep: nextStep });
    }
    return of(undefined);
  }

  goToChoice() {
    this.loading.set(true);
    this.error.set(null);
    
    // Resolution 3: Progressive save - create draft profile immediately
    const userName = this.auth.currentUser()?.name || 'Moi';
    this.profileService.addProfile({
      name: userName,
      birthDate: this.userBirthDate(),
      themePreference: 'colorful',
      isLocal: false,
      onboardingStep: 'choice'
    }).subscribe({
      next: () => {
        this.step.set('choice');
        this.loading.set(false);
      },
      error: (e) => {
        console.error('Draft creation failed', e);
        // If it failed because of unique constraint or similar, maybe it already exists
        this.step.set('choice');
        this.loading.set(false);
      }
    });
  }

  goToProcheChoice() {
    this.error.set(null);
    this.step.set('proche_choice');
  }

  chooseMe() {
    this.loading.set(true);
    this.error.set(null);
    
    // Update the draft profile created in step 1
    const active = this.auth.activeProfile();
    if (active) {
      const userName = this.auth.currentUser()?.name || active.name;
      this.auth.updateProfile({ 
        ...active, 
        name: userName, 
        birthDate: this.userBirthDate(),
        onboardingStep: 'protocol' 
      }).subscribe({
        next: () => {
          this.step.set('protocol_type');
          this.loading.set(false);
        },
        error: (e) => {
          console.error('Me update failed', e);
          this.error.set("Impossible de mettre à jour ton profil.");
          this.loading.set(false);
        }
      });
    } else {
      // Fallback if no draft exists (shouldn't happen with Step 1 save)
      this.step.set('birthdate');
      this.loading.set(false);
    }
  }

  createProche() {
    this.loading.set(true);
    this.error.set(null);
    
    // Update the draft profile created in step 1 with Proche info
    const active = this.auth.activeProfile();
    if (active) {
      this.auth.updateProfile({ 
        ...active, 
        name: this.procheName(), 
        birthDate: this.procheBirthDate(),
        isLocal: true,
        onboardingStep: 'protocol' 
      }).subscribe({
        next: () => {
          this.step.set('protocol_type');
          this.loading.set(false);
        },
        error: (e) => {
          console.error('Proche update failed', e);
          this.error.set("Erreur lors de la mise à jour du dossier.");
          this.loading.set(false);
        }
      });
    } else {
      this.step.set('birthdate');
      this.loading.set(false);
    }
  }

  setProtocolType(type: 'reintroduction' | 'desensibilisation') {
    this.activeDossier.applyProtocolTypePreset(type);
    this.activeDossier.updateStartDate(new Date().toISOString().split('T')[0]);
    this.step.set('config_protocol');
  }

  joinDossier() {
    this.loading.set(true);
    this.error.set(null);
    
    // Delete the draft profile created in step 1 before joining
    const draft = this.auth.activeProfile();
    const deleteDraft$ = draft ? this.profileService.deleteProfile(draft.id) : of(undefined);

    deleteDraft$.pipe(
      switchMap(() => this.sharingService.joinDossier(this.inviteCode()))
    ).subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.loading.set(false);
      },
      error: (e) => {
        console.error('Join failed', e);
        this.error.set("Code invalide ou dossier introuvable.");
        this.loading.set(false);
      }
    });
  }

  onProtocolSaved() {
    this.loading.set(true);
    // Resolution 1: Explicitly save config before moving step
    this.activeDossier.saveCurrentConfig().pipe(
        switchMap(() => this.updateOnboardingStep('symptoms'))
    ).subscribe({
      next: () => {
        this.step.set('config_symptoms');
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Erreur lors de la sauvegarde du protocole.");
        this.loading.set(false);
      }
    });
  }

  onSymptomsSaved() {
    this.loading.set(true);
    this.activeDossier.saveCurrentConfig().pipe(
        switchMap(() => this.updateOnboardingStep('shields'))
    ).subscribe({
      next: () => {
        this.step.set('config_shields');
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Erreur lors de la sauvegarde des symptômes.");
        this.loading.set(false);
      }
    });
  }

  onShieldsSaved() {
    this.loading.set(true);
    this.activeDossier.saveCurrentConfig().pipe(
        switchMap(() => this.updateOnboardingStep('success_me'))
    ).subscribe({
      next: () => {
        this.step.set('success_me');
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Erreur lors de la sauvegarde des protections.");
        this.loading.set(false);
      }
    });
  }

  finishOnboarding() {
    this.loading.set(true);
    this.error.set(null);
    
    // Ensure everything is saved one last time and mark as completed
    this.activeDossier.saveCurrentConfig().pipe(
        switchMap(() => this.updateOnboardingStep('completed')),
        switchMap(() => this.auth.checkSession())
    ).subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.loading.set(false);
      },
      error: () => {
          this.error.set("Erreur lors de la finalisation. Réessaye.");
          this.loading.set(false);
      }
    });
  }
}
