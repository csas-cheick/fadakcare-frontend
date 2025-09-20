// Configuration des API pour les services médicaux
// Copiez ce fichier vers apiConfig.ts et ajustez les URLs selon votre environnement

export const API_CONFIG = {
  // URL de base de l'API backend
  BASE_URL: 'https://fadakcare-backend-1.onrender.com/api',
  
  // Endpoints spécifiques
  ENDPOINTS: {
    // Rendez-vous
    RENDEZVOUS: '/rendezvous',
    RENDEZVOUS_PATIENT: (patientId: number) => `/rendezvous/patient/${patientId}`,
    RENDEZVOUS_MEDECIN: (medecinId: number) => `/rendezvous/medecin/${medecinId}`,
    
    // Patients
    PATIENTS: '/patients',
    PATIENT: (id: number) => `/patients/${id}`,
    
    // Médecins
    MEDECINS: '/medecins',
    MEDECIN: (id: number) => `/medecins/${id}`,
    
    // Authentification
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh'
    }
  },
  
  // Timeout pour les requêtes (en millisecondes)
  TIMEOUT: 10000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Types pour les réponses API communes
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
