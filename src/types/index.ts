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