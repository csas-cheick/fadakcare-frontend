/**
 * Service HTTP de base pour toutes les communications avec l'API
 * Centralise la gestion des erreurs, l'authentification et les intercepteurs
 */

import { ApiResponse, AppError } from '../../types/common';

export class BaseApiService {
  private static baseURL = import.meta.env.VITE_API_BASE_URL || 'https://fadakcare-backend-1.onrender.com/api';
  
  // Méthodes HTTP de base
  static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  static async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  static async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  static async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  // Méthode principale de requête
  private static async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configuration par défaut
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Gestion des réponses vides (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw this.handleRequestError(error);
    }
  }

  // Gestion des headers d'authentification
  private static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Gestion des erreurs de réponse HTTP
  private static async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ApiResponse<null>;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        success: false,
        data: null,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const error: AppError = {
      code: response.status.toString(),
      message: errorData.message || `Erreur ${response.status}`,
      details: { status: response.status, response: errorData },
    };

    // Gestion spéciale pour 401 (non autorisé)
    if (response.status === 401) {
      this.handleUnauthorized();
    }

    throw error;
  }

  // Gestion des erreurs de requête
  private static handleRequestError(error: unknown): AppError {
    if (error instanceof Error) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Erreur de connexion au serveur',
        details: { originalError: error.message },
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'Une erreur inconnue s\'est produite',
      details: { error },
    };
  }

  // Gestion de la déconnexion automatique
  private static handleUnauthorized(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    
    // Redirection vers la page de connexion
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Méthodes utilitaires
  static setBaseURL(url: string): void {
    this.baseURL = url;
  }

  static getBaseURL(): string {
    return this.baseURL;
  }
}
