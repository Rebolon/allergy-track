export type Symptom = 'Rien' | 'Démangeaisons bouche' | 'Respiratoire' | 'Abdominal' | 'Autres';
export type TreatmentName = 'Antihistaminique' | 'Aerius/Aeromire' | 'Adrénaline';
export type Role = 'Supervision' | 'Allergique';

export type AvatarSkinTone = 'default' | 'light' | 'dark';

export interface Profile {
  id: string;
  name: string;
  role: Role;
  themePreference: 'flashy' | 'classic';
  isLocal?: boolean;
  avatar?: string;
  avatarSkinTone?: AvatarSkinTone;
}

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
  updatedAt: string;
  updatedBy: string;
  profileId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profiles: Profile[];
}

export interface HealthStatus {
  status: 'VERT' | 'ORANGE' | 'ROUGE';
  misses: number;
  symptomsCount: number;
}
