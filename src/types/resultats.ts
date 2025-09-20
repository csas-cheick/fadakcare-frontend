/**
 * Types liés aux résultats médicaux
 */

export interface ResultatMedical {
  id: number;
  patientId: number;
  medecinId?: number;
  type: 'analyse_sang' | 'imagerie' | 'ecg' | 'spirometrie' | 'autre';
  titre: string;
  description?: string;
  valeurs?: ResultatValeur[];
  fichiers?: string[];
  dateResultat: string;
  dateCreation: string;
  statut: 'en_attente' | 'validé' | 'à_revoir';
  patient?: {
    id: number;
    nom: string;
  };
  medecin?: {
    id: number;
    nom: string;
    specialite?: string;
  };
}

export interface ResultatValeur {
  nom: string;
  valeur: string | number;
  unite?: string;
  valeurReference?: string;
  normal?: boolean;
  commentaire?: string;
}

export interface CreateResultatRequest {
  patientId: number;
  type: 'analyse_sang' | 'imagerie' | 'ecg' | 'spirometrie' | 'autre';
  titre: string;
  description?: string;
  valeurs?: ResultatValeur[];
  fichiers?: string[];
  dateResultat: string;
}

export interface UpdateResultatRequest {
  id: number;
  titre?: string;
  description?: string;
  valeurs?: ResultatValeur[];
  fichiers?: string[];
  statut?: 'en_attente' | 'validé' | 'à_revoir';
}

export interface ResultatStats {
  totalResultats: number;
  resultatsRecents: number;
  enAttente: number;
  valides: number;
  aRevoir: number;
}
