import { useState, useEffect } from 'react';
import { HeaderUserService, HeaderUserData } from '../services/headerUserService';

interface UseHeaderUserReturn {
  userData: HeaderUserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHeaderUser = (): UseHeaderUserReturn => {
  const [userData, setUserData] = useState<HeaderUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HeaderUserService.getUserHeaderData();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Failed to fetch user data:', err);
      
      // Utiliser des données par défaut en cas d'erreur
      setUserData({
        nom: "Utilisateur",
        email: "user@example.com",
        photoUrl: null,
        role: "user"
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    userData,
    loading,
    error,
    refetch
  };
};
