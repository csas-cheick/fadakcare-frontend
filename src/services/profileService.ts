interface UserProfile {
  nom: string;
  dateNaissance: string;
  adresse: string;
  telephone: string;
  role: string;
  email: string;
  photoUrl: string | null;
  grade?: string;
  profession?: string;
  specialite?: string;
  service?: string;
  numeroOrdre?: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

import { HttpService } from './httpService';
const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class ProfileService {
  
  // Récupérer le profil utilisateur
  static async getUserProfile(role: string, userId: string): Promise<UserProfile> {
    try {
  const { data } = await HttpService.get<UserProfile>(`${API_BASE_URL}/compte/profil/${role}/${userId}`);
  return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateUserProfile(role: string, userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      interface BasePayload {
        nom?: string; email?: string; adresse?: string; telephone?: string; dateNaissance?: string;
        specialite?: string; service?: string; numeroOrdre?: string; profession?: string; grade?: string;
      }
      const payload: BasePayload = {
        nom: profileData.nom,
        email: profileData.email,
        adresse: profileData.adresse,
        telephone: profileData.telephone,
        dateNaissance: profileData.dateNaissance,
      };

      // Ajouter les champs spécifiques au rôle
      if (role === "doctor") {
        payload.specialite = profileData.specialite;
        payload.service = profileData.service;
        payload.numeroOrdre = profileData.numeroOrdre;
      } else if (role === "patient") {
        payload.profession = profileData.profession;
      } else if (role === "admin") {
        payload.grade = profileData.grade;
      }

  const resp = await HttpService.put<UserProfile>(`${API_BASE_URL}/compte/update-profile/${role}/${userId}`, payload);
  if (!resp.ok) throw new Error('Erreur lors de la mise à jour');
  return resp.data as UserProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Changer le mot de passe
  static async changePassword(role: string, userId: string, passwordData: ChangePasswordRequest): Promise<void> {
    try {
  const resp = await HttpService.put(`${API_BASE_URL}/compte/change-password/${role}/${userId}`, passwordData);
  if (!resp.ok) throw new Error('Erreur lors du changement de mot de passe');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Validation des données de profil
  static validateProfileData(profile: UserProfile): string | null {
    if (!profile.nom?.trim()) {
      return "Le nom est obligatoire";
    }
    if (!profile.email?.trim()) {
      return "L'email est obligatoire";
    }
    if (!profile.telephone?.trim()) {
      return "Le téléphone est obligatoire";
    }
    if (!profile.dateNaissance) {
      return "La date de naissance est obligatoire";
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      return "Format d'email invalide";
    }
    
    return null;
  }

  // Validation changement de mot de passe
  static validatePasswordChange(oldPassword: string, newPassword: string, confirmPassword: string): string | null {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return "Tous les champs sont obligatoires";
    }
    
    if (newPassword !== confirmPassword) {
      return "Les mots de passe ne correspondent pas";
    }
    
    if (newPassword.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    return null;
  }

  // Obtenir les informations de l'utilisateur connecté
  static getCurrentUser(): { userId: string | null; role: string | null } {
    return {
      userId: localStorage.getItem("userId"),
      role: localStorage.getItem("userRole")
    };
  }

  // Traiter l'upload d'image de profil
  static handleProfilePicUpload(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Le fichier doit être une image'));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('La taille de l\'image ne doit pas dépasser 5MB'));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      reader.readAsDataURL(file);
    });
  }

  // Formater le rôle pour l'affichage
  static formatRole(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrateur';
      case 'doctor':
        return 'Médecin';
      case 'patient':
        return 'Patient';
      default:
        return role || 'Non défini';
    }
  }
}

export type { UserProfile, ChangePasswordRequest };
