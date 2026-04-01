import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type Persona = 'child' | 'teen' | 'adult';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private auth = inject(AuthService);

    persona = computed<Persona>(() => {
        const user = this.auth.currentUser();
        if (user.role === 'Adulte') return 'adult';
        if (user.themePreference === 'flashy') return 'child';
        return 'teen';
    });

    // Global background
    bgClass = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-amber-50';
            case 'teen': return 'bg-slate-50';
            case 'adult': return 'bg-slate-50';
        }
    });

    // Global text color
    textClass = computed(() => {
        switch (this.persona()) {
            case 'child': return 'text-slate-800';
            case 'teen': return 'text-slate-800';
            case 'adult': return 'text-slate-800';
        }
    });

    // Font family
    fontClass = computed(() => {
        switch (this.persona()) {
            case 'child': return 'font-quicksand';
            case 'teen': return 'font-montserrat';
            case 'adult': return 'font-inter';
        }
    });

    // Header gradient
    headerGradient = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-gradient-to-r from-violet-500 to-fuchsia-500';
            case 'teen': return 'bg-gradient-to-r from-blue-600 to-indigo-600';
            case 'adult': return 'bg-slate-800';
        }
    });

    // Card styles
    cardClass = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-white rounded-3xl shadow-xl shadow-violet-100/50 border-4 border-white';
            case 'teen': return 'bg-white rounded-2xl shadow-sm border border-slate-200';
            case 'adult': return 'bg-white rounded-lg shadow-sm border border-slate-200';
        }
    });

    // Section styles for the form
    protocolSection = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-emerald-50 rounded-3xl p-5 border-2 border-emerald-100';
            case 'teen': return 'bg-white rounded-xl p-5 border border-slate-200 shadow-sm';
            case 'adult': return 'bg-white rounded-lg p-5 border border-slate-200';
        }
    });

    symptomSection = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-amber-50 rounded-3xl p-5 border-2 border-amber-100';
            case 'teen': return 'bg-white rounded-xl p-5 border border-slate-200 shadow-sm';
            case 'adult': return 'bg-white rounded-lg p-5 border border-slate-200';
        }
    });

    treatmentSection = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-rose-50 rounded-3xl p-5 border-2 border-rose-100';
            case 'teen': return 'bg-white rounded-xl p-5 border border-slate-200 shadow-sm';
            case 'adult': return 'bg-white rounded-lg p-5 border border-slate-200';
        }
    });

    noteSection = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-sky-50 rounded-3xl p-5 border-2 border-sky-100';
            case 'teen': return 'bg-white rounded-xl p-5 border border-slate-200 shadow-sm';
            case 'adult': return 'bg-white rounded-lg p-5 border border-slate-200';
        }
    });

    primaryButton = computed(() => {
        switch (this.persona()) {
            case 'child': return 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-2xl shadow-xl shadow-violet-200';
            case 'teen': return 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md';
            case 'adult': return 'bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm';
        }
    });
}
