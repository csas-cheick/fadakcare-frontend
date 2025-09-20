export interface TelemedicineSession {
  id: number;
  createurId: number;
  createurNom?: string;
  titre?: string;
  description?: string;
  dateDebut: string;
  duree: number;
  type?: string;
  etat?: string;
  idSalle?: string;
  createdAt: string;
  participants?: Participant[];
}

export interface Participant {
  id: number;
  utilisateurId: number;
  utilisateurNom?: string;
  utilisateurRole?: string;
  role?: string;
  etat?: string;
  heureArrivee?: string;
  heureDepart?: string;
}

export interface AvailableParticipant {
  id: number;
  nom: string;
  role: string;
  email?: string;
  telephone?: string;
  profession?: string;
  specialite?: string;
  service?: string;
}

export interface CreateSessionRequest {
  titre: string;
  description?: string;
  dateDebut: string;
  duree: number;
  type: 'medecin_patient' | 'medecin_patients' | 'medecin_medecin';
  participantsIds?: number[];
}

export interface UpdateSessionRequest {
  titre?: string;
  description?: string;
  dateDebut?: string;
  duree?: number;
  etat?: 'programmé' | 'en_cours' | 'terminé' | 'annulé';
  participantsIds?: number[];
}

export interface VideoCallState {
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  participants: CallParticipant[];
  messages: ChatMessage[];
}

export interface CallParticipant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
  isLocal?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}
