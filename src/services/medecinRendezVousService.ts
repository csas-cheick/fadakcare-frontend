interface RendezVous {
  id: number;
  date: string;
  etat: string;
  motif?: string;
  patientId: number;
  medecinId?: number;
  patient?: {
    nom: string;
  };
}

interface CreateRendezVousRequest {
  date: string;
  etat: string;
  motif: string;
  patientId: number;
  medecinId: number;
}

interface UpdateRendezVousRequest {
  id: number;
  date: string;
  etat: string;
  motif: string;
  patientId: number;
  medecinId: number;
}

import { HttpService } from './httpService';
const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class MedecinRendezVousService {
  
  // Récupérer tous les rendez-vous d'un médecin
  static async getMedecinRendezVous(medecinId: number): Promise<RendezVous[]> {
    try {
  const { status, data } = await HttpService.get<RendezVous[]>(`${API_BASE_URL}/rendezvous/medecin/${medecinId}`);
  if (status === 404) return [];
  return data || [];
    } catch (error) {
      console.error('Error fetching medecin rendez-vous:', error);
      throw error;
    }
  }

  // Créer un nouveau rendez-vous
  static async createRendezVous(rendezVous: CreateRendezVousRequest): Promise<RendezVous> {
    try {
  const { data } = await HttpService.post<RendezVous>(`${API_BASE_URL}/rendezvous`, rendezVous);
  return data as RendezVous;
    } catch (error) {
      console.error('Error creating rendez-vous:', error);
      throw error;
    }
  }

  // Mettre à jour un rendez-vous
  static async updateRendezVous(rendezVous: UpdateRendezVousRequest): Promise<RendezVous> {
    try {
  const { data } = await HttpService.put<RendezVous>(`${API_BASE_URL}/rendezvous/${rendezVous.id}`, rendezVous);
  return data as RendezVous;
    } catch (error) {
      console.error('Error updating rendez-vous:', error);
      throw error;
    }
  }

  // Supprimer un rendez-vous
  static async deleteRendezVous(id: number): Promise<void> {
    try {
  const resp = await HttpService.delete(`${API_BASE_URL}/rendezvous/${id}`);
  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    } catch (error) {
      console.error('Error deleting rendez-vous:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un rendez-vous
  static async updateRendezVousStatus(id: number, nouvelEtat: string): Promise<void> {
    try {
  const resp = await HttpService.put(`${API_BASE_URL}/rendezvous/${id}/etat`, nouvelEtat);
  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    } catch (error) {
      console.error('Error updating rendez-vous status:', error);
      throw error;
    }
  }

  // Formater la date pour l'affichage
  static formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Valider les données d'un rendez-vous
  static validateRendezVous(date: string, heure: string, motif: string): string | null {
    if (!date || !heure || !motif.trim()) {
      return "Veuillez renseigner la date, l'heure et le motif";
    }
    
    const fullDate = new Date(`${date}T${heure}`);
    const now = new Date();
    
    if (fullDate <= now) {
      return "La date et l'heure doivent être dans le futur";
    }
    
    return null;
  }

  // Convertir les données pour le calendrier
  static convertToCalendarEvents(rendezVousList: RendezVous[]) {
    return rendezVousList.map(rdv => ({
      id: rdv.id.toString(),
      title: rdv.patient?.nom ? `${rdv.patient.nom}` : `Patient ${rdv.patientId}`,
      start: rdv.date,
      extendedProps: {
        calendar: rdv.etat === 'accepté' ? 'Success' : 
                  rdv.etat === 'refusé' ? 'Danger' : 'Warning',
        status: rdv.etat,
        motif: rdv.motif || 'Consultation',
        patientId: rdv.patientId,
        medecinId: rdv.medecinId,
        patientNom: rdv.patient?.nom || `Patient ${rdv.patientId}`
      }
    }));
  }
}

export type { RendezVous, CreateRendezVousRequest, UpdateRendezVousRequest };
