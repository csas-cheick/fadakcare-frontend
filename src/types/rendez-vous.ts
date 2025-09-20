/**
 * Types liés aux rendez-vous
 */

export interface RendezVous {
  id: number;
  date: string;
  heure?: string;
  etat: 'en_attente' | 'accepté' | 'refusé' | 'annulé' | 'terminé';
  motif?: string;
  commentaires?: string;
  type?: 'consultation' | 'suivi' | 'urgence' | 'telemedecine';
  patientId: number;
  medecinId?: number;
  patient?: {
    id: number;
    nom: string;
    email?: string;
    telephone?: string;
  };
  medecin?: {
    id: number;
    nom: string;
    specialite?: string;
  };
  dateCreation?: string;
  derniereMiseAJour?: string;
}

export interface CreateRendezVousRequest {
  date: string;
  heure?: string;
  motif: string;
  commentaires?: string;
  type: 'consultation' | 'suivi' | 'urgence' | 'telemedecine';
  patientId: number;
  medecinId?: number;
}

export interface UpdateRendezVousRequest {
  id: number;
  date?: string;
  heure?: string;
  etat?: 'en_attente' | 'accepté' | 'refusé' | 'annulé' | 'terminé';
  motif?: string;
  commentaires?: string;
  type?: 'consultation' | 'suivi' | 'urgence' | 'telemedecine';
  medecinId?: number;
}

export interface RendezVousStats {
  total: number;
  enAttente: number;
  acceptes: number;
  refuses: number;
  annules: number;
  termines: number;
}

// Types pour le calendrier
export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  extendedProps: {
    status: string;
    motif?: string;
    patientId: number;
    medecinId?: number;
    type?: string;
  };
}
