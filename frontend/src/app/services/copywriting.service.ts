import { Injectable, computed, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class CopywritingService {
    private theme = inject(ThemeService);

    protocolsTitle = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return '🍽️ Mes Défis Gourmands';
            case 'teen': return '⚡ Protocole de Désensibilisation';
            case 'adult': return '📋 Suivi des Prises';
        }
    });

    symptomsTitle = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return '🤒 Comment je me sens ?';
            case 'teen': return '🔍 Suivi des Symptômes';
            case 'adult': return '🩺 Évaluation Clinique';
        }
    });

    treatmentsTitle = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return '🛡️ Mes Boucliers Magiques';
            case 'teen': return '💊 Gestion du Traitement';
            case 'adult': return '⚕️ Médication Associée';
        }
    });

    noteTitle = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return '✍️ Mon petit mot';
            case 'teen': return '📝 Notes & Remarques';
            case 'adult': return '📓 Observations';
        }
    });

    saveButton = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return '✨ Enregistrer ma journée !';
            case 'teen': return 'Valider ma saisie';
            case 'adult': return 'Sauvegarder les données';
        }
    });

    successMessage = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return '🎉 Super ! Journée enregistrée !';
            case 'teen': return '✅ Saisie validée avec succès.';
            case 'adult': return 'Données enregistrées.';
        }
    });

    missedMessage = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return 'La régularité est la clé ! Chaque jour compte pour que ton corps s\'habitue. 💪';
            case 'teen': return 'Attention à l\'observance. La désensibilisation nécessite une prise quotidienne.';
            case 'adult': return 'Rappel : L\'efficacité du protocole dépend de la régularité des prises.';
        }
    });

    streakTitle = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return 'Série :';
            case 'teen': return 'Streak :';
            case 'adult': return 'Série en cours :';
        }
    });

    streakBrokenMessage = computed(() => {
        switch (this.theme.persona()) {
            case 'child': return 'Oh oh, tu as oublié hier ! Ce n\'est pas grave, on recommence une super série aujourd\'hui ! 💪';
            case 'teen': return 'Pas de saisie hier. Reprends ton rythme dès aujourd\'hui pour relancer ton streak.';
            case 'adult': return 'Rupture de l\'observance détectée hier. Veuillez reprendre vos prises régulières.';
        }
    });
}
