/**
 * Service API pour la gestion des rendez-vous
 */

import { BaseApiService } from './base-api.service';
import { 
  RendezVous, 
  CreateRendezVousRequest, 
  UpdateRendezVousRequest, 
  RendezVousStats,
  CalendarEvent 
} from '../../types/rendez-vous';
import { PaginatedResponse, SearchFilters } from '../../types/common';

export class RendezVousApiService extends BaseApiService {
  private static readonly ENDPOINTS = {
    rendezVous: '/rendezvous',
    rendezVousById: (id: number) => `/rendezvous/${id}`,
    rendezVousStats: '/rendezvous/stats',
    patientRendezVous: (patientId: number) => `/rendezvous/patient/${patientId}`,
    medecinRendezVous: (medecinId: number) => `/rendezvous/medecin/${medecinId}`,
    updateStatus: (id: number) => `/rendezvous/${id}/status`,
  };

  /**
   * Récupération de tous les rendez-vous avec pagination
   */
  static async getRendezVous(
    page = 1, 
    limit = 10, 
    filters?: SearchFilters
  ): Promise<PaginatedResponse<RendezVous>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return this.get<PaginatedResponse<RendezVous>>(`${this.ENDPOINTS.rendezVous}?${params}`);
  }

  /**
   * Récupération d'un rendez-vous par ID
   */
  static async getRendezVousById(id: number): Promise<RendezVous> {
    return this.get<RendezVous>(this.ENDPOINTS.rendezVousById(id));
  }

  /**
   * Création d'un nouveau rendez-vous
   */
  static async createRendezVous(rendezVousData: CreateRendezVousRequest): Promise<RendezVous> {
    return this.post<RendezVous>(this.ENDPOINTS.rendezVous, rendezVousData);
  }

  /**
   * Mise à jour d'un rendez-vous
   */
  static async updateRendezVous(rendezVousData: UpdateRendezVousRequest): Promise<RendezVous> {
    return this.put<RendezVous>(this.ENDPOINTS.rendezVousById(rendezVousData.id), rendezVousData);
  }

  /**
   * Suppression d'un rendez-vous
   */
  static async deleteRendezVous(id: number): Promise<void> {
    return this.delete<void>(this.ENDPOINTS.rendezVousById(id));
  }

  /**
   * Récupération des rendez-vous d'un patient
   */
  static async getPatientRendezVous(patientId: number): Promise<RendezVous[]> {
    return this.get<RendezVous[]>(this.ENDPOINTS.patientRendezVous(patientId));
  }

  /**
   * Récupération des rendez-vous d'un médecin
   */
  static async getMedecinRendezVous(medecinId: number): Promise<RendezVous[]> {
    return this.get<RendezVous[]>(this.ENDPOINTS.medecinRendezVous(medecinId));
  }

  /**
   * Mise à jour du statut d'un rendez-vous
   */
  static async updateRendezVousStatus(
    id: number, 
    status: 'en_attente' | 'accepté' | 'refusé' | 'annulé' | 'terminé'
  ): Promise<RendezVous> {
    return this.put<RendezVous>(this.ENDPOINTS.updateStatus(id), { etat: status });
  }

  /**
   * Récupération des statistiques des rendez-vous
   */
  static async getRendezVousStats(): Promise<RendezVousStats> {
    return this.get<RendezVousStats>(this.ENDPOINTS.rendezVousStats);
  }

  /**
   * Conversion des rendez-vous en événements de calendrier
   */
  static convertToCalendarEvents(rendezVousList: RendezVous[]): CalendarEvent[] {
    return rendezVousList.map(rdv => ({
      id: rdv.id.toString(),
      title: rdv.motif || 'Rendez-vous',
      start: rdv.date,
      extendedProps: {
        status: rdv.etat,
        motif: rdv.motif,
        patientId: rdv.patientId,
        medecinId: rdv.medecinId,
        type: rdv.type,
      },
    }));
  }

  /**
   * Formatage de date pour l'affichage
   */
  static formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
