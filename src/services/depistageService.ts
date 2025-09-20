import { Question, Questionnaire } from '../types';
import { HttpService } from './httpService';

const API_URL = "https://fadakcare-backend-1.onrender.com/api";

export class DepistageService {
  /**
   * Récupère tous les questionnaires
   */
  static async fetchQuestionnaires(): Promise<Questionnaire[]> {
    try {
  const { status, data } = await HttpService.get<Questionnaire[]>(`${API_URL}/admin/depistage/liste`);
  if (status === 404) return [];
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des questionnaires:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau questionnaire
   */
  static async createQuestionnaire(title: string, questions: Question[]): Promise<Questionnaire> {
    try {
      const questionnaireData = {
        title,
        questions
      };

  const resp = await HttpService.post<Questionnaire>(`${API_URL}/admin/depistage/creationQuestionnaire`, questionnaireData);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as Questionnaire;
    } catch (error) {
      console.error('Erreur lors de la création du questionnaire:', error);
      throw error;
    }
  }

  /**
   * Met à jour un questionnaire
   */
  static async updateQuestionnaire(id: number, title: string, questions: Question[]): Promise<Questionnaire> {
    try {
      const questionnaireData = {
        title,
        questions
      };

  const resp = await HttpService.put<Questionnaire>(`${API_URL}/admin/depistage/${id}`, questionnaireData);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as Questionnaire;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du questionnaire:', error);
      throw error;
    }
  }

  /**
   * Supprime un questionnaire
   */
  static async deleteQuestionnaire(id: number): Promise<void> {
    try {
  const resp = await HttpService.delete(`${API_URL}/admin/depistage/${id}`);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du questionnaire:', error);
      throw error;
    }
  }

  /**
   * Récupère un questionnaire par ID
   */
  static async getQuestionnaireById(id: number): Promise<Questionnaire> {
    try {
  const resp = await HttpService.get<Questionnaire>(`${API_URL}/admin/depistage/${id}`);
  if (!resp.ok) throw new Error(`Erreur ${resp.status}: ${resp.statusText}`);
  return resp.data as Questionnaire;
    } catch (error) {
      console.error('Erreur lors du chargement du questionnaire:', error);
      throw error;
    }
  }
}

// Fonctions compatibles avec l'ancien code
export const fetchQuestionnaires = (): Promise<Questionnaire[]> => DepistageService.fetchQuestionnaires();

export const createQuestionnaire = (title: string, questions: { text: string; type: string }[]): Promise<Questionnaire> => {
  // Convert simple questions to full Question objects  
  const fullQuestions: Question[] = questions.map((q, index) => ({
    id: index + 1, // Temporary ID, will be replaced by server
    text: q.text,
    type: q.type as Question['type'],
    options: q.type === 'choix unique' || q.type === 'choix multiple' ? [] : undefined
  }));
  
  return DepistageService.createQuestionnaire(title, fullQuestions);
};

export const updateQuestionnaire = (id: number, title: string, questions: { text: string; type: string }[]): Promise<Questionnaire> => {
  // Convert simple questions to full Question objects
  const fullQuestions: Question[] = questions.map((q, index) => ({
    id: index + 1, // Temporary ID, will be replaced by server
    text: q.text,
    type: q.type as Question['type'],
    options: q.type === 'choix unique' || q.type === 'choix multiple' ? [] : undefined
  }));
  
  return DepistageService.updateQuestionnaire(id, title, fullQuestions);
};

export const deleteQuestionnaire = (id: number): Promise<void> => DepistageService.deleteQuestionnaire(id);