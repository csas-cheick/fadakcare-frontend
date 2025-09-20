/**
 * Service API pour la gestion de l'authentification
 */

import { BaseApiService } from './base-api.service';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  PasswordResetRequest, 
  PasswordResetConfirm,
  GoogleAuthData 
} from '../../types/auth';

export class AuthApiService extends BaseApiService {
  private static readonly ENDPOINTS = {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyCode: '/auth/verify-code',
    googleAuth: '/auth/google',
    profile: '/auth/profile',
  };

  /**
   * Connexion avec email/mot de passe
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>(this.ENDPOINTS.login, credentials);
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>(this.ENDPOINTS.register, userData);
  }

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    await this.post(this.ENDPOINTS.logout, { refreshToken });
    
    // Nettoyage du stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }

  /**
   * Renouvellement du token
   */
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible');
    }

    return this.post<AuthResponse>(this.ENDPOINTS.refreshToken, { refreshToken });
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  static async forgotPassword(request: PasswordResetRequest): Promise<void> {
    return this.post<void>(this.ENDPOINTS.forgotPassword, request);
  }

  /**
   * Vérification du code de réinitialisation
   */
  static async verifyResetCode(code: string): Promise<boolean> {
    return this.post<boolean>(this.ENDPOINTS.verifyCode, { code });
  }

  /**
   * Réinitialisation du mot de passe
   */
  static async resetPassword(data: PasswordResetConfirm): Promise<void> {
    return this.post<void>(this.ENDPOINTS.resetPassword, data);
  }

  /**
   * Authentification avec Google
   */
  static async googleAuth(googleData: GoogleAuthData): Promise<AuthResponse> {
    return this.post<AuthResponse>(this.ENDPOINTS.googleAuth, googleData);
  }

  /**
   * Récupération du profil utilisateur connecté
   */
  static async getProfile(): Promise<User> {
    return this.get<User>(this.ENDPOINTS.profile);
  }

  /**
   * Mise à jour du profil utilisateur
   */
  static async updateProfile(userData: Partial<User>): Promise<User> {
    return this.put<User>(this.ENDPOINTS.profile, userData);
  }

  /**
   * Vérification de la validité du token
   */
  static async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  }
}
