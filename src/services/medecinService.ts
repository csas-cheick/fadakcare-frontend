export interface MedecinDto {
  nom: string;
  specialite: string;
  telephone: string;
  email: string;
  service: string;
  photoUrl?: string;
}

import { HttpService } from './httpService';
const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class MedecinService {
  // Récupérer le médecin d'un patient
  static async getMonMedecin(patientId: number): Promise<MedecinDto | null> {
    try {
  const { data, status } = await HttpService.get<MedecinDto | null>(`${API_BASE_URL}/medecins/MonMedecin/${patientId}`);
  if (status === 404) return null;
  return data as MedecinDto;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      console.error('Erreur lors du chargement du médecin:', error);
      throw error;
    }
  }

  // Récupérer tous les médecins (pour admin)
  static async getAllMedecins(): Promise<MedecinDto[]> {
    try {
  const { data } = await HttpService.get<MedecinDto[]>(`${API_BASE_URL}/medecins`);
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      throw error;
    }
  }

  // Assigner un médecin à un patient (pour admin)
  static async assignerMedecin(patientId: number, medecinId: number): Promise<boolean> {
    try {
  const resp = await HttpService.post(`${API_BASE_URL}/medecins/assigner`, { patientId, medecinId });
  return resp.ok;
    } catch (error) {
      console.error('Erreur lors de l\'assignation du médecin:', error);
      return false;
    }
  }
}
