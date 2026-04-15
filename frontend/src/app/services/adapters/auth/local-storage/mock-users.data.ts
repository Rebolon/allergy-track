import { User, Profile, ProfileAccess } from '../../../../models/allergy-track.model';

// On définit des types partiels car l'interface globale 'User' attend des profils nichés opérationnels
export type MockUser = Omit<User, 'profiles' | 'profileAccesses'>;

export const MOCK_USERS: MockUser[] = [
  { id: 'usermock0000001', email: 'firstconnection@test.fr', name: 'Jean-Marc (Nouveau)' },
  { id: 'usermock0000002', email: 'onboarding@test.fr', name: 'Lucas (En cours)' },
  { id: 'usermock0000003', email: 'mixte@test.fr', name: 'Jean-Marc (Standard)' },
  { id: 'usermock0000004', email: 'parent.allergique@test.fr', name: 'Famille Dupont' },
  { id: 'usermock0000005', email: 'editeur@test.fr', name: 'Sophie (Éditeur)' },
  { id: 'usermock0000006', email: 'medecin@test.fr', name: 'Dr. House (Lecteur)' }
];

export const MOCK_PROFILES: Profile[] = [
  { id: 'profmock0000002', name: 'Mon Lucas', themePreference: 'colorful', birthDate: '2020-05-12', onboardingStep: 'protocol' },
  { id: 'profmock0000003', name: 'Mon Compte', themePreference: 'classic', birthDate: '1985-06-15', onboardingStep: 'completed' },
  { id: 'profmock0000041', name: 'Maman', themePreference: 'classic', birthDate: '1988-03-20', onboardingStep: 'completed' },
  { id: 'profmock0000042', name: 'Léo', themePreference: 'colorful', birthDate: '2018-11-10', onboardingStep: 'completed' }
];

export interface MockAccess {
  userId: string;
  profileId: string;
  role: 'owner' | 'editor' | 'reader';
  colorCode?: string;
}

export const MOCK_ACCESSES: MockAccess[] = [
  // Lucas (Onboarding)
  { userId: 'usermock0000002', profileId: 'profmock0000002', role: 'owner', colorCode: '#6366f1' },
  
  // Jean-Marc (Standard)
  { userId: 'usermock0000003', profileId: 'profmock0000003', role: 'owner', colorCode: '#10b981' },
  
  // Famille Dupont
  { userId: 'usermock0000004', profileId: 'profmock0000041', role: 'owner', colorCode: '#3b82f6' },
  { userId: 'usermock0000004', profileId: 'profmock0000042', role: 'owner', colorCode: '#f59e0b' },
  
  // Sophie (Editeur de Léo)
  { userId: 'usermock0000005', profileId: 'profmock0000042', role: 'editor', colorCode: '#ec4899' },
  
  // Médecin (Lecteur de Léo)
  { userId: 'usermock0000006', profileId: 'profmock0000042', role: 'reader', colorCode: '#8b5cf6' }
];
