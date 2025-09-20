import { HttpService } from './httpService';
import { RendezVous, CreateRendezVousRequest, UpdateRendezVousRequest } from './rendezVousService';

const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class RendezVousApiService {
  
  // Récupérer tous les rendez-vous d'un patient
  static async getPatientRendezVous(patientId: number): Promise<RendezVous[]> {
    try {
      const response = await HttpService.get<RendezVous[]>(`${API_BASE_URL}/rendezvous/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient rendez-vous:', error);
      throw new Error('Impossible de récupérer les rendez-vous. Vérifiez votre connexion.');
    }
  }

  // Créer un nouveau rendez-vous
  static async createRendezVous(rendezVous: CreateRendezVousRequest): Promise<RendezVous> {
    try {
      const response = await HttpService.post<RendezVous>(`${API_BASE_URL}/rendezvous`, rendezVous);
      return response.data;
    } catch (error) {
      console.error('Error creating rendez-vous:', error);
      throw new Error('Impossible de créer le rendez-vous. Vérifiez les informations saisies.');
    }
  }

  // Modifier un rendez-vous existant
  static async updateRendezVous(rendezVous: UpdateRendezVousRequest): Promise<RendezVous> {
    try {
      const response = await HttpService.put<RendezVous>(`${API_BASE_URL}/rendezvous`, rendezVous);
      return response.data;
    } catch (error) {
      console.error('Error updating rendez-vous:', error);
      throw new Error('Impossible de modifier le rendez-vous.');
    }
  }

  // Supprimer un rendez-vous
  static async deleteRendezVous(id: number): Promise<void> {
    try {
      await HttpService.delete(`${API_BASE_URL}/rendezvous/${id}`);
    } catch (error) {
      console.error('Error deleting rendez-vous:', error);
      throw new Error('Impossible de supprimer le rendez-vous.');
    }
  }

  // Récupérer les rendez-vous d'un médecin
  static async getMedecinRendezVous(medecinId: number): Promise<RendezVous[]> {
    try {
      const response = await HttpService.get<RendezVous[]>(`${API_BASE_URL}/rendezvous/medecin/${medecinId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medecin rendez-vous:', error);
      throw new Error('Impossible de récupérer les rendez-vous du médecin.');
    }
  }

  // Approuver un rendez-vous (pour médecin)
  static async approuverRendezVous(id: number, medecinId: number): Promise<RendezVous> {
    try {
      const response = await HttpService.put<RendezVous>(`${API_BASE_URL}/rendezvous/${id}/approve`, {
        medecinId,
        etat: 'accepté'
      });
      return response.data;
    } catch (error) {
      console.error('Error approving rendez-vous:', error);
      throw new Error('Impossible d\'approuver le rendez-vous.');
    }
  }

  // Rejeter un rendez-vous (pour médecin)
  static async rejeterRendezVous(id: number, raison?: string): Promise<RendezVous> {
    try {
      const response = await HttpService.put<RendezVous>(`${API_BASE_URL}/rendezvous/${id}/reject`, {
        etat: 'refusé',
        raison
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting rendez-vous:', error);
      throw new Error('Impossible de rejeter le rendez-vous.');
    }
  }
}

export type { RendezVous, CreateRendezVousRequest, UpdateRendezVousRequest };
