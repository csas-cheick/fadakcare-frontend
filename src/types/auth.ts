/**
 * Types liés à l'authentification et aux utilisateurs
 */

export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'patient' | 'medecin' | 'admin';
  dateCreation?: string;
  derniereConnexion?: string;
}

export interface LoginCredentials {
  email: string;
  motDePasse: string;
}

export interface RegisterData {
  nom: string;
  email: string;
  motDePasse: string;
  confirmMotDePasse: string;
  telephone: string;
  dateNaissance: string;
  role?: 'patient' | 'medecin';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GoogleAuthData {
  googleId: string;
  email: string;
  nom: string;
  profilePicture?: string;
}
