export const SYMPTOM_EMOJIS: Record<string, string> = {
  'Rien': '😎',
  'Démangeaisons bouche': '👄',
  'Respiratoire': '🫁',
  'Abdominal': '🤢',
  'Autres': '🤔'
};

export const TREATMENT_ICONS: Record<string, string> = {
  'Antihistaminique': '💊',
  'Aerius/Aeromire': '💨',
  'Adrénaline': '💉'
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
