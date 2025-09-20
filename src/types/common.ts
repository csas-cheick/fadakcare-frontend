/**
 * Types utilitaires et génériques
 */

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les filtres et recherche
export interface SearchFilters {
  query?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  type?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Types pour les composants UI
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Types pour le stockage local
export interface UserSession {
  userId: number;
  role: string;
  token: string;
  expiresAt: string;
}

// Types pour les stats et métriques
export interface DashboardStats {
  patients?: number;
  medecins?: number;
  rendezVous?: number;
  alertes?: number;
  nouveauxPatients?: number;
  rendezVousAujourdhui?: number;
  alertesNonTraitees?: number;
}
