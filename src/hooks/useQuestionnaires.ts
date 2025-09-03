import { useState, useEffect, useCallback } from 'react';
import { Question, Questionnaire } from '../types';
import { DepistageService } from '../services/depistageService';

export const useQuestionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les questionnaires
  const fetchQuestionnaires = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DepistageService.fetchQuestionnaires();
      setQuestionnaires(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des questionnaires');
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un questionnaire
  const createQuestionnaire = useCallback(async (title: string, _description: string, questions: Question[]): Promise<Questionnaire> => {
    try {
      const newQuestionnaire = await DepistageService.createQuestionnaire(title, questions);
      setQuestionnaires(prev => [...prev, newQuestionnaire]);
      return newQuestionnaire;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du questionnaire';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Mettre à jour un questionnaire
  const updateQuestionnaire = useCallback(async (id: number, title: string, _description: string, questions: Question[]): Promise<Questionnaire> => {
    try {
      const updatedQuestionnaire = await DepistageService.updateQuestionnaire(id, title, questions);
      setQuestionnaires(prev => prev.map(q => q.id === id ? updatedQuestionnaire : q));
      return updatedQuestionnaire;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du questionnaire';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Supprimer un questionnaire
  const deleteQuestionnaire = useCallback(async (id: number): Promise<void> => {
    try {
      await DepistageService.deleteQuestionnaire(id);
      setQuestionnaires(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du questionnaire';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Recharger les données
  const refetch = useCallback(() => {
    return fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  return {
    questionnaires,
    loading,
    error,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    refetch
  };
};
