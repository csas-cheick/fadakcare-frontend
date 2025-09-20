import axios from 'axios';
import { TelemedicineSession, CreateSessionRequest, UpdateSessionRequest, Participant, AvailableParticipant } from '../types/telemedecine';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fadakcare-backend-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse pour gérer le rafraîchissement du token (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const status = error?.response?.status;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const userId = localStorage.getItem('userId');
        if (!refreshToken || !userId) {
          return Promise.reject(error);
        }
        const refreshUrl = `${API_BASE_URL}/auth/refresh`;
        const resp = await axios.post(refreshUrl, {
          userId: Number(userId),
          refreshToken,
        });
        const newAccessToken: string | undefined = resp?.data?.accessToken;
        if (!newAccessToken) {
          return Promise.reject(error);
        }
        // Mettre à jour le token et rejouer la requête originale
        localStorage.setItem('authToken', newAccessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api.request(originalRequest);
  } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const telemedicineAPI = {
  // Créer une nouvelle session
  createSession: async (data: CreateSessionRequest): Promise<TelemedicineSession> => {
    const response = await api.post('/telemedicine', data);
    return response.data;
  },

  // Mettre à jour une session
  updateSession: async (id: number, data: UpdateSessionRequest): Promise<TelemedicineSession> => {
    const response = await api.put(`/telemedicine/${id}`, data);
    return response.data;
  },

  // Récupérer les participants disponibles selon le type de session
  getAvailableParticipants: async (sessionType: string): Promise<AvailableParticipant[]> => {
    const response = await api.get(`/telemedicine/participants/${sessionType}`);
    return response.data;
  },

  // Supprimer une session
  deleteSession: async (id: number): Promise<void> => {
    await api.delete(`/telemedicine/${id}`);
  },

  // Récupérer une session par ID
  getSession: async (id: number): Promise<TelemedicineSession> => {
    const response = await api.get(`/telemedicine/${id}`);
    return response.data;
  },

  // Récupérer mes sessions
  getMySessions: async (etat?: string): Promise<TelemedicineSession[]> => {
    const params = etat ? { etat } : {};
    const response = await api.get('/telemedicine/my-sessions', { params });
    return response.data;
  },

  // Récupérer toutes les sessions (admin)
  getAllSessions: async (etat?: string): Promise<TelemedicineSession[]> => {
    const params = etat ? { etat } : {};
    const response = await api.get('/telemedicine/all', { params });
    return response.data;
  },

  // Rejoindre une session
  joinSession: async (id: number): Promise<void> => {
    await api.post(`/telemedicine/${id}/join`);
  },

  // Quitter une session
  leaveSession: async (id: number): Promise<void> => {
    await api.post(`/telemedicine/${id}/leave`);
  },

  // Ajouter un participant
  addParticipant: async (sessionId: number, utilisateurId: number): Promise<void> => {
    await api.post(`/telemedicine/${sessionId}/participants`, {
      telemedicineId: sessionId,
      utilisateurId,
      role: 'participant'
    });
  },

  // Retirer un participant
  removeParticipant: async (sessionId: number, participantId: number): Promise<void> => {
    await api.delete(`/telemedicine/${sessionId}/participants/${participantId}`);
  },

  // Récupérer les participants d'une session
  getSessionParticipants: async (sessionId: number): Promise<Participant[]> => {
    const response = await api.get(`/telemedicine/${sessionId}/participants`);
    return response.data;
  },

  // Sessions à venir
  getUpcomingSessions: async (): Promise<TelemedicineSession[]> => {
    const response = await api.get('/telemedicine/upcoming');
    return response.data;
  },

  // Historique des sessions
  getSessionHistory: async (): Promise<TelemedicineSession[]> => {
    const response = await api.get('/telemedicine/history');
    return response.data;
  },

  // Mettre à jour l'état d'une session
  updateSessionState: async (sessionId: number, etat: string): Promise<void> => {
    await api.put(`/telemedicine/${sessionId}/state`, { etat });
  },
};

export default telemedicineAPI;
