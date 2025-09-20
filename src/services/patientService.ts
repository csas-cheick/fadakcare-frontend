import { Patient, Medecin } from '../types';
import { HttpService } from './httpService';

const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class PatientService {
  // Récupérer tous les patients
  static async fetchPatients(): Promise<Patient[]> {
    try {
  const { data } = await HttpService.get<Patient[]>(`${API_BASE_URL}/patients/details`);
  return data || [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      console.error('Erreur lors de la récupération des patients:', error);
      throw error;
    }
  }

  // Récupérer tous les médecins
  static async fetchMedecins(): Promise<Medecin[]> {
    try {
  const { data } = await HttpService.get<Medecin[]>(`${API_BASE_URL}/medecins/listeMedecins`);
  return data || [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      console.error('Erreur lors de la récupération des médecins:', error);
      throw error;
    }
  }

  // Affecter un patient à un médecin
  static async affecterPatient(patientId: number, medecinId: number): Promise<void> {
    try {
  await HttpService.put(`${API_BASE_URL}/patients/${patientId}/affecter/${medecinId}`);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      console.error('Erreur lors de l\'affectation:', error);
      throw error;
    }
  }

  // Désaffecter un patient
  static async desaffecterPatient(patientId: number): Promise<void> {
    try {
  await HttpService.put(`${API_BASE_URL}/patients/${patientId}/desaffecter`);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      console.error('Erreur lors de la désaffectation:', error);
      throw error;
    }
  }

  // Récupérer les patients d'un médecin
  static async fetchPatientsByMedecin(medecinId: number): Promise<Patient[]> {
    try {
  const { data } = await HttpService.get<Patient[]>(`${API_BASE_URL}/patients/medecin/${medecinId}`);
  return data || [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      console.error('Erreur lors de la récupération des patients par médecin:', error);
      throw error;
    }
  }
}
