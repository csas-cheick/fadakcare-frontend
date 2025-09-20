import { Medecin, NewMedecin, Patient } from '../types';
import { HttpService, HttpError } from './httpService';

const API_URL = "https://fadakcare-backend-1.onrender.com/api";

// Interface pour les données brutes du backend
interface BackendMedecin {
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
  EstBloque?: boolean; // Backend utilise une majuscule
  estBloque?: boolean; // Au cas où le backend utiliserait une minuscule
}

export class MedecinAdminService {
  /**
   * Récupère la liste de tous les médecins
   */
  static async fetchMedecins(): Promise<Medecin[]> {
    try {
      const { status, data } = await HttpService.get<BackendMedecin[]>(`${API_URL}/medecins/listeMedecins`);
      if (status === 404) return [];
      
      // Normaliser les noms de propriétés du backend vers le frontend
      const normalizedData = (data || []).map((medecin: BackendMedecin): Medecin => ({
        id: medecin.id,
        nom: medecin.nom,
        dateNaissance: medecin.dateNaissance,
        email: medecin.email,
        telephone: medecin.telephone,
        service: medecin.service,
        specialite: medecin.specialite,
        numeroOrdre: medecin.numeroOrdre,
        adresse: medecin.adresse,
        photoUrl: medecin.photoUrl,
        nombrePatients: medecin.nombrePatients || 0,
        estBloque: medecin.EstBloque || medecin.estBloque || false, // Gestion des deux casses possibles
      }));
      
      return normalizedData;
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
      return resp.data as Medecin;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du médecin:', error);
      // Re-lance l'erreur telle quelle pour préserver le message d'erreur du serveur
      if (error instanceof HttpError) {
        throw new Error(error.message);
      }
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

  /**
   * Bloque un médecin
   */
  static async bloquerMedecin(id: number): Promise<void> {
    try {
      const resp = await HttpService.post(`${API_URL}/medecins/${id}/bloquer`, {});
      if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors du blocage du médecin:', error);
      throw error;
    }
  }

  /**
   * Débloque un médecin
   */
  static async debloquerMedecin(id: number): Promise<void> {
    try {
      const resp = await HttpService.post(`${API_URL}/medecins/${id}/debloquer`, {});
      if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors du déblocage du médecin:', error);
      throw error;
    }
  }
}
