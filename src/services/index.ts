/**
 * Point d'entrée principal pour tous les services - VERSION RESTRUCTURÉE
 * Organisation hiérarchique: API -> Business -> Utils
 */

// ===== NOUVEAUX SERVICES STRUCTURÉS =====

// Services API (communication avec le backend)
export * from './api';

// Services Business (logique métier)
export * from './business/auth-business.service';

// Services utilitaires
export * from './utils/data-utils.service';

// ===== SERVICES LEGACY (compatibilité) =====
// À migrer progressivement vers la nouvelle architecture

export { MedecinService } from './medecinService';
export type { MedecinDto } from './medecinService';
export { ResultatService } from './resultatService';
export type { PatientResult } from './resultatService';
export { ReportService } from './reportService';

// Export des autres services existants
export * from './authService';
export * from './patientService';
export * from './rendezVousService';
export * from './depistageService';
export * from './messageService';
export * from './notificationService';
export * from './telemedicineService';
export * from './httpService';

// ===== CONFIGURATION ET INITIALISATION =====

/**
 * Initialisation complète des services
 */
export const initializeServices = () => {
  console.log('🚀 Initialisation des services FadakCare...');
  
  // Initialiser les nouveaux services API
  try {
    // Les services utilisent automatiquement la config d'environnement
    console.log('✅ Services API initialisés');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des services:', error);
  }
  
  console.log('🎉 Services FadakCare prêts');
};

/**
 * Helper pour la gestion centralisée des erreurs
 */
export const handleServiceError = (error: unknown, context = 'Service'): string => {
  console.error(`[${context}] Erreur:`, error);
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  
  return 'Une erreur est survenue. Veuillez réessayer.';
};
