export interface Message {
  id: number;
  expediteurId: number;
  destinataireId: number;
  contenu: string;
  dateEnvoi: string;
}

export interface Utilisateur {
  id: number;
  nom: string;
  isOnline?: boolean;
  lastSeen?: string;
  avatar?: string;
  photoUrl?: string;
}

export interface Conversation {
  contact: Utilisateur;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

import { HttpService } from './httpService';
const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export class MessageService {
  private static getUserId(): number {
    return parseInt(localStorage.getItem('userId') || '0');
  }

  // Récupérer les contacts (utilisateurs avec qui on peut discuter)
  static async getContacts(): Promise<Utilisateur[]> {
    try {
      const userId = this.getUserId();
  const { data } = await HttpService.get<Utilisateur[]>(`${API_BASE_URL}/messages/contacts?userId=${userId}`);
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      // Retourner des données de test en cas d'erreur
      return [
        { id: 1, nom: 'Dr. Martin Dubois', isOnline: true },
        { id: 2, nom: 'Dr. Sophie Laurent', isOnline: false, lastSeen: 'Vu il y a 5 min' },
        { id: 3, nom: 'Dr. Pierre Moreau', isOnline: true }
      ];
    }
  }

  // Récupérer les conversations avec les derniers messages
  static async getConversations(): Promise<Conversation[]> {
    try {
      const contacts = await this.getContacts();
      // Pour chaque contact, on pourrait récupérer le dernier message
      // Ici on simule cette logique
      return contacts.map(contact => ({
        contact,
        lastMessage: 'Dernière conversation...',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        unreadCount: Math.floor(Math.random() * 3)
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      return [];
    }
  }

  // Récupérer les messages d'une conversation
  static async getMessages(contactId: number): Promise<Message[]> {
    try {
      const userId = this.getUserId();
  const { data } = await HttpService.get<Message[]>(`${API_BASE_URL}/messages/conversation/${contactId}?userId=${userId}`);
  return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      return [];
    }
  }

  // Envoyer un message
  static async sendMessage(destinataireId: number, contenu: string): Promise<boolean> {
    try {
      const userId = this.getUserId();
  const resp = await HttpService.post(`${API_BASE_URL}/messages/envoyer`, { expediteurId: userId, destinataireId, contenu });
  return resp.ok;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return false;
    }
  }

  // Modifier un message
  static async editMessage(messageId: number, contenu: string): Promise<boolean> {
    try {
  const resp = await HttpService.put(`${API_BASE_URL}/messages/${messageId}`, { contenu });
  return resp.ok;
    } catch (error) {
      console.error('Erreur lors de la modification du message:', error);
      return false;
    }
  }

  // Supprimer un message
  static async deleteMessage(messageId: number): Promise<boolean> {
    try {
  const resp = await HttpService.delete(`${API_BASE_URL}/messages/${messageId}`);
  return resp.ok;
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      return false;
    }
  }
}
