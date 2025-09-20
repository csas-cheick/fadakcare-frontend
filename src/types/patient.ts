/**
 * Types liés aux patients
 */

export interface Patient {
  id: number;
  nom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  profession: string;
  adresse?: string;
  numeroSecuriteSociale?: string;
  photoUrl?: string;
  medecin?: {
    id: number;
    nom: string;
    specialite?: string;
  };
  dateCreation?: string;
  derniereMiseAJour?: string;
  estBloque?: boolean;
}

export interface NewPatient {
  nom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  profession: string;
  adresse?: string;
  numeroSecuriteSociale?: string;
  medecinId?: number;
  photoUrl?: string;
}

export interface UpdatePatient {
  id: number;
  nom?: string;
  dateNaissance?: string;
  telephone?: string;
  profession?: string;
  adresse?: string;
  numeroSecuriteSociale?: string;
  medecinId?: number;
}

export interface PatientStats {
  totalPatients: number;
  nouveauxPatients: number;
  patientsActifs: number;
  patientsSuivis: number;
}
