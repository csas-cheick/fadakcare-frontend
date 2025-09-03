import { useState, useEffect, useCallback } from 'react';
import { PatientService } from '../services/patientService';
import { Patient, Medecin } from '../types';

interface UsePatientsReturn {
  patients: Patient[];
  medecins: Medecin[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  affecterPatient: (patientId: number, medecinId: number) => Promise<void>;
  desaffecterPatient: (patientId: number) => Promise<void>;
}

export const usePatients = (): UsePatientsReturn => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [patientsData, medecinsData] = await Promise.all([
        PatientService.fetchPatients(),
        PatientService.fetchMedecins()
      ]);
      
      setPatients(patientsData);
      setMedecins(medecinsData);
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  const affecterPatient = useCallback(async (patientId: number, medecinId: number) => {
    await PatientService.affecterPatient(patientId, medecinId);
    await fetchData(); // Recharger les données
  }, [fetchData]);

  const desaffecterPatient = useCallback(async (patientId: number) => {
    await PatientService.desaffecterPatient(patientId);
    await fetchData(); // Recharger les données
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    patients,
    medecins,
    loading,
    error,
    refetch: fetchData,
    affecterPatient,
    desaffecterPatient
  };
};
