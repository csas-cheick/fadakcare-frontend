export interface PatientResult {
  id: number;
  numeroDepistage: number;
  dateDepistage: string;
  score: number;
  analyse: string;
  // Nouvelle propriété pour relier au dépistage (ajoutée côté backend)
  depistageId?: number; // optionnel pour compat rétro
}

// Réponses détaillées d'un dépistage
export interface DepistageReponseItem {
  questionId: number;
  questionText: string;
  type: string;
  valeur: string | null;
}

export interface DepistageReponses {
  depistageId: number;
  patientId: number;
  dateDepistage: string;
  resultatId?: number | null;
  score?: number | null;
  reponses: DepistageReponseItem[];
}

import { HttpService } from './httpService';

export class ResultatService {
  private static readonly BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

  static async getResultatsPatient(patientId: number): Promise<PatientResult[]> {
    try {
  const { status, data } = await HttpService.get<PatientResult[]>(`${this.BASE_URL}/patients/resultat/${patientId}`);
  if (status === 404) return [];
  return data || [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      console.error('Erreur lors de la récupération des résultats:', error);
      throw error;
    }
  }

  static async getResultatById(resultId: number): Promise<PatientResult> {
    try {
  const resp = await HttpService.get<PatientResult>(`${this.BASE_URL}/patients/resultat/detail/${resultId}`);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as PatientResult;
    } catch (error) {
      console.error('Erreur lors de la récupération du résultat:', error);
      throw error;
    }
  }

  static async getDepistageReponses(depistageId: number): Promise<DepistageReponses> {
    try {
  const resp = await HttpService.get<DepistageReponses>(`${this.BASE_URL}/depistage/${depistageId}/reponses`);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as DepistageReponses;
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses du dépistage:', error);
      throw error;
    }
  }

  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return new Intl.DateTimeFormat('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  }
}
