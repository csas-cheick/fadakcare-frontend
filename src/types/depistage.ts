/**
 * Types liés au dépistage et aux questionnaires
 */

export interface Question {
  id: number;
  text: string;
  type: 'texte' | 'numérique' | 'booléen' | 'choix unique' | 'choix multiple' | 'select';
  options?: string[];
  obligatoire?: boolean;
  questionnaireId?: number;
  derniereReponse?: string | null;
  ordre?: number;
}

export interface Questionnaire {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
  dateCreation?: string;
  dateModification?: string;
  actif?: boolean;
  categorie?: string;
}

export interface ReponseQuestion {
  questionId: number;
  reponse: string | number | boolean | string[];
  dateReponse: string;
}

export interface DepistageResult {
  id: number;
  questionnaireId: number;
  patientId: number;
  reponses: ReponseQuestion[];
  score?: number;
  niveau?: 'faible' | 'modéré' | 'élevé' | 'critique';
  recommandations?: string[];
  dateDepistage: string;
  medecinId?: number;
}

export interface DepistageStats {
  totalDepistages: number;
  depistagesRecents: number;
  niveauxRisque: {
    faible: number;
    modéré: number;
    élevé: number;
    critique: number;
  };
}
