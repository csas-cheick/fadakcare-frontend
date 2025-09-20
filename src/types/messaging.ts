/**
 * Types liés aux messages et notifications
 */

export interface Message {
  id: number;
  contenu: string;
  expediteurId: number;
  destinataireId: number;
  dateEnvoi: string;
  lu?: boolean;
  type?: 'texte' | 'image' | 'document';
  expediteur?: {
    id: number;
    nom: string;
    role: string;
  };
  destinataire?: {
    id: number;
    nom: string;
    role: string;
  };
}

export interface Conversation {
  id: number;
  participants: {
    id: number;
    nom: string;
    role: string;
  }[];
  dernierMessage?: Message;
  messagesNonLus: number;
  dateCreation: string;
  dernierActivite: string;
}

export interface SendMessageRequest {
  contenu: string;
  destinataireId: number;
  type?: 'texte' | 'image' | 'document';
}

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  utilisateurId: number;
  lu?: boolean;
  dateCreation: string;
  lien?: string;
  action?: string;
}

export interface CreateNotificationRequest {
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  utilisateurId: number;
  lien?: string;
  action?: string;
}
