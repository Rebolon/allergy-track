export type Symptom = 'Rien' | 'Démangeaisons bouche' | 'Respiratoire' | 'Abdominal' | 'Autres';
export type TreatmentName = 'Antihistaminique' | 'Aerius/Aeromire' | 'Adrénaline';

export type PermissionLevel = 'owner' | 'editor' | 'reader';

export interface ProfileAccess {
  profileId: string;
  permission: PermissionLevel;
  colorCode?: string; // Hex color for the context circle
}

export interface Profile {
  id: string;
  name: string;
  birthDate?: string; // YYYY-MM-DD
  themePreference: 'colorful' | 'classic';
  isLocal?: boolean;
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
  profileAccesses: ProfileAccess[];
  profiles: Profile[]; // Loaded profiles
}

export interface HealthStatus {
  status: 'VERT' | 'ORANGE' | 'ROUGE';
  misses: number;
  symptomsCount: number;
}
