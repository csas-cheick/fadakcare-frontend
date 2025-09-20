/**
 * Service métier pour la gestion de l'authentification
 * Gère la logique business liée à l'authentification, au-delà des simples appels API
 */

import { AuthApiService } from '../api/auth-api.service';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  GoogleAuthData
} from '../../types';

export class AuthBusinessService {
  private static readonly STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    USER_ROLE: 'userRole',
    USER_DATA: 'userData',
  };

  /**
   * Connexion avec gestion complète de la session
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await AuthApiService.login(credentials);
      
      // Sauvegarde de la session
      this.saveUserSession(response);
      
      // Log de connexion
      console.log(`Utilisateur connecté: ${response.user.nom} (${response.user.role})`);
      
      return response.user;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription avec validation métier
   */
  static async register(userData: RegisterData): Promise<User> {
    // Validations métier
    this.validateRegistrationData(userData);
    
    try {
      const response = await AuthApiService.register(userData);
      
      // Sauvegarde de la session pour auto-connexion
      this.saveUserSession(response);
      
      return response.user;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Déconnexion complète
   */
  static async logout(): Promise<void> {
    try {
      await AuthApiService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyage local même en cas d'erreur API
      this.clearUserSession();
      
      // Redirection vers la page de connexion
      window.location.href = '/login';
    }
  }

  /**
   * Vérification et renouvellement automatique du token
   */
  static async ensureValidToken(): Promise<boolean> {
    const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    if (!token) {
      return false;
    }

    // Vérification de la validité du token
    const isValid = await AuthApiService.validateToken();
    if (isValid) {
      return true;
    }

    // Tentative de renouvellement
    try {
      const response = await AuthApiService.refreshToken();
      this.saveUserSession(response);
      return true;
    } catch {
      this.clearUserSession();
      return false;
    }
  }

  /**
   * Récupération des informations utilisateur connecté
   */
  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Vérification du rôle utilisateur
   */
  static hasRole(role: string): boolean {
    const userRole = localStorage.getItem(this.STORAGE_KEYS.USER_ROLE);
    return userRole === role;
  }

  /**
   * Vérification des permissions
   */
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Logique de permissions basée sur le rôle
    switch (user.role) {
      case 'admin':
        return true; // Admin a toutes les permissions
      case 'medecin':
        return ['read_patients', 'write_patients', 'read_rendez_vous', 'write_rendez_vous'].includes(permission);
      case 'patient':
        return ['read_own_data', 'write_own_data'].includes(permission);
      default:
        return false;
    }
  }

  /**
   * Réinitialisation de mot de passe avec gestion d'état
   */
  static async forgotPassword(email: string): Promise<void> {
    await AuthApiService.forgotPassword({ email });
    
    // Sauvegarde temporaire de l'email pour la suite du processus
    sessionStorage.setItem('reset_email', email);
  }

  /**
   * Authentification Google avec logique métier
   */
  static async googleLogin(googleData: GoogleAuthData): Promise<User> {
    try {
      const response = await AuthApiService.googleAuth(googleData);
      this.saveUserSession(response);
      return response.user;
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      throw error;
    }
  }

  // Méthodes privées

  private static saveUserSession(authResponse: AuthResponse): void {
    localStorage.setItem(this.STORAGE_KEYS.TOKEN, authResponse.token);
    localStorage.setItem(this.STORAGE_KEYS.USER_ID, authResponse.user.id.toString());
    localStorage.setItem(this.STORAGE_KEYS.USER_ROLE, authResponse.user.role);
    localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));
    
    if (authResponse.refreshToken) {
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken);
    }
  }

  private static clearUserSession(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    sessionStorage.clear();
  }

  private static validateRegistrationData(data: RegisterData): void {
    if (data.motDePasse !== data.confirmMotDePasse) {
      throw new Error('Les mots de passe ne correspondent pas');
    }

    if (data.motDePasse.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Format d\'email invalide');
    }
  }
}
