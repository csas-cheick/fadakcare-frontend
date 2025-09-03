import { useState, useEffect, useCallback } from 'react';
import { Medecin, NewMedecin, Patient } from '../types';
import { MedecinAdminService } from '../services/medecinAdminService';

export const useMedecins = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les médecins
  const fetchMedecins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MedecinAdminService.fetchMedecins();
      setMedecins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des médecins');
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajouter un médecin
  const addMedecin = useCallback(async (medecinData: NewMedecin): Promise<Medecin> => {
    try {
      const newMedecin = await MedecinAdminService.addMedecin(medecinData);
      setMedecins(prev => [...prev, newMedecin]);
      return newMedecin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du médecin';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Mettre à jour un médecin
  const updateMedecin = useCallback(async (id: number, medecinData: Partial<Medecin>): Promise<Medecin> => {
    try {
      const updatedMedecin = await MedecinAdminService.updateMedecin(id, medecinData);
      setMedecins(prev => prev.map(m => m.id === id ? updatedMedecin : m));
      return updatedMedecin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du médecin';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Supprimer un médecin
  const deleteMedecin = useCallback(async (id: number): Promise<void> => {
    try {
      await MedecinAdminService.deleteMedecin(id);
      setMedecins(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du médecin';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Récupérer les patients d'un médecin
  const fetchPatientsByMedecin = useCallback(async (medecinId: number): Promise<Patient[]> => {
    try {
      return await MedecinAdminService.fetchPatientsByMedecin(medecinId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des patients';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Recharger les données
  const refetch = useCallback(() => {
    return fetchMedecins();
  }, [fetchMedecins]);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchMedecins();
  }, [fetchMedecins]);

  return {
    medecins,
    loading,
    error,
    addMedecin,
    updateMedecin,
    deleteMedecin,
    fetchPatientsByMedecin,
    refetch
  };
};
