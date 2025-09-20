/**
 * Point d'entrée central pour tous les types TypeScript
 * Réorganisé pour une meilleure maintenabilité
 */

// Types d'authentification
export * from './auth';

// Types des patients
export * from './patient';

// Types des médecins
export * from './medecin';

// Types des rendez-vous
export * from './rendez-vous';

// Types du dépistage
export * from './depistage';

// Types de messagerie
export * from './messaging';

// Types des résultats médicaux
export * from './resultats';

// Types des alertes
export * from './alertes';

// Types de télémédecine
export * from './telemedecine';

// Types utilitaires et génériques
export * from './common';

// Anciens types (à migrer progressivement)
// Gardés temporairement pour compatibilité
export interface Question {
  id: number;
  text: string;
  type: 'texte' | 'numérique' | 'booléen' | 'choix unique' | 'choix multiple' | 'select';
  options?: string[];
  questionnaireId?: number;
  derniereReponse?: string | null;
}

export interface Questionnaire {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Patient {
  photoUrl: string | null | undefined;
  id: number;
  nom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  profession: string;
  medecin?: {
    id: number;
    nom: string;
  };
  estBloque?: boolean;
}

export interface Medecin {
  id: number;
  nom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  service: string;
  specialite: string;
  nombrePatients: number;
  numeroOrdre: string;
  adresse?: string;
  estBloque?: boolean;
  photoUrl?: string;
}

export interface NewMedecin {
  nom: string;
  dateNaissance: string;
  telephone: string;
  email: string;
  motDePasse: string;
  adresse: string;
  specialite: string;
  numeroOrdre: string;
  service: string;
}