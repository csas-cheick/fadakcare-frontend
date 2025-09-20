import { useState, useEffect, useCallback } from 'react';
import { MedecinService, MedecinDto } from '../services/medecinService';

interface UseMedecinResult {
  medecin: MedecinDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMedecin = (patientId: number): UseMedecinResult => {
  const [medecin, setMedecin] = useState<MedecinDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedecin = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MedecinService.getMonMedecin(patientId);
      setMedecin(data);
    } catch (err) {
      console.error(err);
      
      // Pour les vraies erreurs de connexion
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId > 0) {
      fetchMedecin();
    }
  }, [fetchMedecin, patientId]);

  return {
    medecin,
    loading,
    error,
    refetch: fetchMedecin
  };
};
