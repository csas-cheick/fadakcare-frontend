import { Patient } from '../types';
import { HttpService, HttpError } from './httpService';

const API_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class PatientAdminService {
  /**
   * Récupère tous les patients avec leurs détails
   */
  static async getAllPatients(): Promise<Patient[]> {
    try {
      const resp = await HttpService.get<Patient[]>(`${API_URL}/patients/details`);
      return resp.data as Patient[];
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      // Re-lance l'erreur telle quelle pour préserver le message d'erreur du serveur
      if (error instanceof HttpError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Bloque un patient
   */
  static async bloquerPatient(id: number): Promise<void> {
    try {
      const resp = await HttpService.post(`${API_URL}/patients/${id}/bloquer`, {});
      if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors du blocage du patient:', error);
      throw error;
    }
  }

  /**
   * Débloque un patient
   */
  static async debloquerPatient(id: number): Promise<void> {
    try {
      const resp = await HttpService.post(`${API_URL}/patients/${id}/debloquer`, {});
      if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors du déblocage du patient:', error);
      throw error;
    }
  }

  /**
   * Affecte un patient à un médecin
   */
  static async affecterPatient(patientId: number, medecinId: number): Promise<void> {
    try {
      const resp = await HttpService.put(`${API_URL}/patients/${patientId}/affecter/${medecinId}`, {});
      if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors de l\'affectation du patient:', error);
      throw error;
    }
  }

  /**
   * Désaffecte un patient
   */
  static async desaffecterPatient(patientId: number): Promise<void> {
    try {
      const resp = await HttpService.put(`${API_URL}/patients/${patientId}/desaffecter`, {});
      if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors de la désaffectation du patient:', error);
      throw error;
    }
  }
}