import { HttpService } from './httpService';

interface HeaderUserData {
  nom: string;
  email: string;
  photoUrl: string | null;
  role: string;
}

export class HeaderUserService {
  private static readonly API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

  // Récupérer les données utilisateur pour le header
  static async getUserHeaderData(): Promise<HeaderUserData> {
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!role || !userId) {
      throw new Error("Utilisateur non authentifié");
    }

    try {
      const response = await HttpService.get<HeaderUserData>(
        `${this.API_BASE_URL}/compte/profil/${role}/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user header data:', error);
      throw new Error('Impossible de récupérer les données utilisateur');
    }
  }

  // Formater le nom pour l'affichage
  static formatDisplayName(nom: string): string {
    if (!nom) return "Utilisateur";
    
    // Retourner le prénom uniquement pour l'affichage court
    const parts = nom.trim().split(' ');
    return parts[0];
  }

  // Gérer l'image de profil par défaut
  static getProfileImageUrl(profilePic: string | null): string {
    if (profilePic) {
      // Si c'est une base64, la retourner directement
      if (profilePic.startsWith('data:image/')) {
        return profilePic;
      }
      // Si c'est une URL, la retourner
      if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
        return profilePic;
      }
      // Si c'est un chemin relatif, construire l'URL complète
      return `/images/user/${profilePic}`;
    }
    
    // Image par défaut
    return "/images/user/owner.jpg";
  }

  // Formater le rôle pour l'affichage
  static formatRole(role: string): string {
    switch (role?.toLowerCase()) {
      case 'patient':
        return 'Patient';
      case 'doctor':
        return 'Médecin';
      case 'admin':
        return 'Administrateur';
      default:
        return role || 'Utilisateur';
    }
  }
}

export type { HeaderUserData };
