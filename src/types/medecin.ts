/**
 * Types liés aux médecins
 */

export interface Medecin {
  id: number;
  nom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  service: string;
  specialite: string;
  numeroOrdre: string;
  adresse?: string;
  photoUrl?: string;
  nombrePatients?: number;
  dateCreation?: string;
  derniereMiseAJour?: string;
  estBloque?: boolean;
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
  photoUrl?: string;
}

export interface UpdateMedecin {
  id: number;
  nom?: string;
  dateNaissance?: string;
  telephone?: string;
  adresse?: string;
  specialite?: string;
  numeroOrdre?: string;
  service?: string;
}

export interface MedecinStats {
  totalMedecins: number;
  nouveauxMedecins: number;
  medecinsActifs: number;
  specialites: { [key: string]: number };
}
