import { Injectable, signal, Inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'classic' | 'colorful';
export type Persona = 'child' | 'teen' | 'adult'; // For backward compatibility safely

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'allergy_track_theme';
  
  // Signal holds the current theme state
  public readonly currentTheme = signal<AppTheme>('colorful'); 

  // Legacy Persona for backwards compatibility. Will be set to 'child' on colorful, 'teen' on classic
  public readonly persona = signal<Persona>('child');

  // Unified css classes using var(--color-xxx) from our styles.css
  public cardClass = signal('glass card-rounded p-5 shadow-[var(--shadow-soft)] transition-colors duration-300');
  public protocolSection = signal('bg-[var(--color-section-protocol)] card-rounded p-5 border-2 border-[var(--color-border-protocol)] mb-4 transition-colors duration-300');
  public symptomSection = signal('bg-[var(--color-section-symptom)] card-rounded p-5 border-2 border-[var(--color-border-symptom)] mb-4 transition-colors duration-300');
  public treatmentSection = signal('bg-[var(--color-section-treatment)] card-rounded p-5 border-2 border-[var(--color-border-treatment)] mb-4 transition-colors duration-300');
  public noteSection = signal('bg-[var(--color-section-note)] card-rounded p-5 border-2 border-[var(--color-border-note)] mb-4 transition-colors duration-300');
  public primaryButton = signal('bg-[var(--color-primary)] hover:bg-[var(--color-primary-focus)] text-white p-3 rounded-[var(--border-radius-base)] transition-colors shadow-md');

  // Legacy layout classes mapping to empty or simple since CSS vars handle background now
  public bgClass = signal('');
  public textClass = signal('');
  public fontClass = signal('');
  public headerGradient = signal('');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY) as AppTheme;
      if (savedTheme === 'classic' || savedTheme === 'colorful') {
        this.currentTheme.set(savedTheme);
        this.persona.set(savedTheme === 'colorful' ? 'child' : 'teen');
      }
    }

    effect(() => {
      const theme = this.currentTheme();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.THEME_KEY, theme);
        
        if (theme === 'colorful') {
          document.body.classList.add('theme-colorful');
          this.persona.set('child');
        } else {
          document.body.classList.remove('theme-colorful');
          this.persona.set('teen');
        }
      }
    }, { allowSignalWrites: true });
  }

  public toggleTheme(): void {
    this.currentTheme.update(theme => theme === 'classic' ? 'colorful' : 'classic');
  }

  public setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
  }
}


