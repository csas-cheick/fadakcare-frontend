/**
 * Types liés aux alertes médicales
 */

export interface Alerte {
  id: number;
  titre: string;
  description: string;
  niveau: 'faible' | 'modéré' | 'élevé' | 'critique';
  type: 'medicale' | 'technique' | 'administrative';
  patientId?: number;
  medecinId?: number;
  statut: 'active' | 'traitée' | 'fermée';
  dateCreation: string;
  dateTraitement?: string;
  traitéPar?: {
    id: number;
    nom: string;
    role: string;
  };
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

export interface CreateAlerteRequest {
  titre: string;
  description: string;
  niveau: 'faible' | 'modéré' | 'élevé' | 'critique';
  type: 'medicale' | 'technique' | 'administrative';
  patientId?: number;
  medecinId?: number;
}

export interface UpdateAlerteRequest {
  id: number;
  statut?: 'active' | 'traitée' | 'fermée';
  niveau?: 'faible' | 'modéré' | 'élevé' | 'critique';
  description?: string;
}

export interface AlerteStats {
  totalAlertes: number;
  alertesActives: number;
  alertesTraitées: number;
  alertesFermées: number;
  parNiveau: {
    faible: number;
    modéré: number;
    élevé: number;
    critique: number;
  };
}
