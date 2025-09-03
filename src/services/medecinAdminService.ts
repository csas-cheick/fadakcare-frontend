import { Medecin, NewMedecin, Patient } from '../types';
import { HttpService } from './httpService';

const API_URL = "http://localhost:5120/api";

export class MedecinAdminService {
  /**
   * Récupère la liste de tous les médecins
   */
  static async fetchMedecins(): Promise<Medecin[]> {
    try {
  const { status, data } = await HttpService.get<Medecin[]>(`${API_URL}/medecins/listeMedecins`);
  if (status === 404) return [];
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      throw error;
    }
  }

  /**
   * Ajoute un nouveau médecin
   */
  static async addMedecin(medecinData: NewMedecin): Promise<Medecin> {
    try {
      const formattedData = {
        ...medecinData,
        dateNaissance: new Date(medecinData.dateNaissance).toISOString(),
        role: "doctor"
      };

  const resp = await HttpService.post<Medecin>(`${API_URL}/medecins/ajouterMedecin`, formattedData);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as Medecin;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du médecin:', error);
      throw error;
    }
  }

  /**
   * Récupère les patients d'un médecin
   */
  static async fetchPatientsByMedecin(medecinId: number): Promise<Patient[]> {
    try {
  const { status, data } = await HttpService.get<Patient[]>(`${API_URL}/patients/medecin/${medecinId}`);
  if (status === 404) return [];
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des patients du médecin:', error);
      throw error;
    }
  }

  /**
   * Met à jour les informations d'un médecin
   */
  static async updateMedecin(id: number, medecinData: Partial<Medecin>): Promise<Medecin> {
    try {
  const resp = await HttpService.put<Medecin>(`${API_URL}/medecins/${id}`, medecinData);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as Medecin;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du médecin:', error);
      throw error;
    }
  }

  /**
   * Supprime un médecin
   */
  static async deleteMedecin(id: number): Promise<void> {
    try {
  const resp = await HttpService.delete(`${API_URL}/medecins/${id}`);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du médecin:', error);
      throw error;
    }
  }
}
