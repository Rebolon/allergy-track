export type Symptom = 'Rien' | 'Démangeaisons bouche' | 'Respiratoire' | 'Abdominal' | 'Autres';
export type TreatmentName = 'Antihistaminique' | 'Aerius/Aeromire' | 'Adrénaline';
export type Role = 'Adulte' | 'Enfant';

export interface AllergenIntake {
  allergen: string;
  dose: number;
  taken: boolean;
}

export interface Treatment {
  name: TreatmentName;
  before: boolean;
  after: boolean;
}

export interface DailyLog {
  id: string;
  externalId?: string;
  date: string; // YYYY-MM-DD
  intakes: AllergenIntake[];
  symptoms: Symptom[];
  treatments: Treatment[];
  note?: string;
  updatedAt: string; // ISO string
  updatedBy: string; // User ID
}

export interface User {
  id: string;
  name: string;
  role: Role;
  themePreference: 'flashy' | 'classic';
}

export interface HealthStatus {
  status: 'VERT' | 'ORANGE' | 'ROUGE';
  misses: number;
  symptomsCount: number;
}
