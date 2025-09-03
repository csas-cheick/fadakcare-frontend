import { useState, useEffect, useCallback } from 'react';
import { PatientResume, MedecinPatientsService } from '../services/medecinPatientsService';

export const useMedecinPatients = (medecinId: number) => {
  const [patients, setPatients] = useState<PatientResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les patients du médecin
  const fetchPatients = useCallback(async () => {
    if (!medecinId) {
      setError('ID médecin manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await MedecinPatientsService.fetchMedecinPatients(medecinId);
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  }, [medecinId]);

  // Recharger les données
  const refetch = useCallback(() => {
    return fetchPatients();
  }, [fetchPatients]);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    refetch
  };
};
