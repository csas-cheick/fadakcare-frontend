/**
 * Point d'entrée pour tous les services API
 * Centralise l'accès aux services de communication avec le backend
 */

// Service de base
export { BaseApiService } from './base-api.service';

// Services spécialisés
export { AuthApiService } from './auth-api.service';
export { PatientApiService } from './patient-api.service';
export { RendezVousApiService } from './rendez-vous-api.service';

// Services à créer/migrer
// export { MedecinApiService } from './medecin-api.service';
// export { DepistageApiService } from './depistage-api.service';
// export { MessageApiService } from './message-api.service';
// export { NotificationApiService } from './notification-api.service';
// export { ResultatApiService } from './resultat-api.service';
// export { AlerteApiService } from './alerte-api.service';
// export { TelemedicineApiService } from './telemedecine-api.service';

/**
 * Configuration globale des services API
 */
export const ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://fadakcare-backend-1.onrender.com/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Initialisation des services API
 */
export const initializeApiServices = () => {
  // Configuration globale des services
  // Note: BaseApiService utilise déjà la configuration via import.meta.env
  console.log('Services API initialisés avec:', ApiConfig.baseURL);
};

/**
 * Helper pour la gestion des erreurs API
 */
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Une erreur est survenue lors de la communication avec le serveur';
};
