interface RendezVous {
  id: number;
  date: string;
  etat: string;
  motif?: string;
  patientId: number;
  medecinId?: number;
}

interface CreateRendezVousRequest {
  date: string;
  etat: string;
  motif: string;
  patientId: number;
}

interface UpdateRendezVousRequest {
  id: number;
  date: string;
  etat: string;
  motif: string;
  patientId: number;
}

import { HttpService } from './httpService';
const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class RendezVousService {
  
  // Récupérer tous les rendez-vous d'un patient
  static async getPatientRendezVous(patientId: number): Promise<RendezVous[]> {
    try {
  const { data } = await HttpService.get<RendezVous[]>(`${API_BASE_URL}/rendezvous/patient/${patientId}`);
  return data || [];
    } catch (error) {
      console.error('Error fetching patient rendez-vous:', error);
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

  // Modifier un rendez-vous existant
  static async updateRendezVous(rendezVous: UpdateRendezVousRequest): Promise<RendezVous> {
    try {
  const { data } = await HttpService.put<RendezVous>(`${API_BASE_URL}/rendezvous`, rendezVous);
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
      title: rdv.motif || 'Rendez-vous',
      start: rdv.date,
      extendedProps: {
        calendar: rdv.etat === 'accepté' ? 'Success' : 
                  rdv.etat === 'refusé' ? 'Danger' : 'Warning',
        status: rdv.etat,
        motif: rdv.motif || 'Consultation',
        patientId: rdv.patientId,
        medecinId: rdv.medecinId
      }
    }));
  }
}

export type { RendezVous, CreateRendezVousRequest, UpdateRendezVousRequest };
