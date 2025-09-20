import { Patient } from '../types';
import { HttpService } from './httpService';

const API_URL = "https://fadakcare-backend-1.onrender.com/api";

export interface PatientResume {
  id: number;
  nom: string;
  dateNaissance: string;
  email: string;
  adresse: string;
  photoUrl?: string;
  nombreDepistages: number;
}

export class MedecinPatientsService {
  /**
   * Récupère la liste des patients d'un médecin
   */
  static async fetchMedecinPatients(medecinId: number): Promise<PatientResume[]> {
    try {
  const { status, data } = await HttpService.get<PatientResume[]>(`${API_URL}/medecins/${medecinId}/Mespatients`);
  if (status === 404) return [];
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des patients du médecin:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un patient spécifique
   */
  static async getPatientDetails(patientId: number): Promise<Patient> {
    try {
  const resp = await HttpService.get<Patient>(`${API_URL}/patients/${patientId}`);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as Patient;
    } catch (error) {
      console.error('Erreur lors du chargement des détails du patient:', error);
      throw error;
    }
  }

  /**
   * Récupère les dépistages d'un patient
   */
  static async getPatientDepistages(patientId: number): Promise<unknown[]> {
    try {
  const { status, data } = await HttpService.get<unknown[]>(`${API_URL}/patients/${patientId}/depistages`);
  if (status === 404) return [];
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des dépistages du patient:', error);
      throw error;
    }
  }

  /**
   * Récupère les résultats détaillés d'un patient (similaire au code de référence)
   */
  static async getPatientResultatsDetails(patientId: number): Promise<PatientDetailsWithResults> {
    try {
  const resp = await HttpService.get<PatientDetailsWithResults>(`${API_URL}/patients/resultat/${patientId}/details`);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as PatientDetailsWithResults;
    } catch (error) {
      console.error('Erreur lors du chargement des résultats du patient:', error);
      throw error;
    }
  }
}

export interface DepistageResult {
  id: number;
  numeroDepistage: number;
  dateDepistage: string;
  score: number;
  analyse: string;
}

export interface PatientDetailsWithResults {
  nom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  profession: string;
  resultats: DepistageResult[];
}

export const medecinPatientsService = new MedecinPatientsService();
