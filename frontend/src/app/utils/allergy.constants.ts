export const SYMPTOM_EMOJIS: Record<string, string> = {
  'Rien': '😎',
  'Démangeaisons bouche': '👄',
  'Respiratoire': '🫁',
  'Abdominal': '🤢',
  'Rhinite': '🤧',
  'Asthme': '🫁',
  'Urticaire': '🐝',
  'Conjonctivite': '👁️',
  'Eczéma': '🧴',
  'Œdème': '🫀',
  'Choc anaphylactique': '🚨',
  'Vomissements': '🤮',
  'Diarrhée': '💩',
  'Maux de tête': '🤕',
  'Maux de ventre': '🤢',
  'Gonflement': '🫀',
  'Rougeurs': '🔴',
  'Éruption cutanée': '🧴',
  'Éternuements': '🤧',
  'Toux': '😷',
  'Autres': '🤔'
};

export const TREATMENT_ICONS: Record<string, string> = {
  'Antihistaminique': '💊',
  'Aerius/Aeromire': '💨',
  'Adrénaline': '💉',
  'Corticoide': '💊',
  'Ventoline': '💨',
  'Autre': '💊'
};

export const HEALTH_STATUS_ICONS: Record<string, string> = {
  'VERT': '😎',
  'ORANGE': '🤔',
  'ROUGE': '🚨'
};

export function getSymptomEmoji(symptom: string): string {
  return SYMPTOM_EMOJIS[symptom] || '🤒';
}

export function getTreatmentIcon(name: string): string {
  return TREATMENT_ICONS[name] || '💊';
}

export function getHealthStatusEmoji(status?: string): string {
  if (!status) return 'help';
  return HEALTH_STATUS_ICONS[status] || 'help';
}
