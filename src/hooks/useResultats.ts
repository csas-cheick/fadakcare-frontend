import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultatService, PatientResult } from '../services/resultatService';

interface UseResultatsReturn {
  resultats: PatientResult[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useResultats = (patientId: number): UseResultatsReturn => {
  const [resultats, setResultats] = useState<PatientResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchResultats = useCallback(async () => {
    if (!patientId) {
      setError("Patient non identifié - Veuillez vous reconnecter");
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await ResultatService.getResultatsPatient(patientId);
      setResultats(data);
    } catch (err) {
      console.error("Erreur de récupération:", err);
      
      // Si c'est une erreur 404, on ne l'affiche pas comme une erreur mais on laisse la liste vide
      if (err instanceof Error && err.message.includes('404')) {
        setResultats([]);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des résultats');
      }
    } finally {
      setLoading(false);
    }
  }, [patientId, navigate]);

  const refetch = async () => {
    await fetchResultats();
  };

  useEffect(() => {
    fetchResultats();
  }, [fetchResultats]);

  return {
    resultats,
    loading,
    error,
    refetch
  };
};
