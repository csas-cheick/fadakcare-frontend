/**
 * Service API pour la gestion des patients
 */

import { BaseApiService } from './base-api.service';
import { 
  Patient, 
  NewPatient, 
  UpdatePatient, 
  PatientStats 
} from '../../types/patient';
import { PaginatedResponse, SearchFilters } from '../../types/common';

export class PatientApiService extends BaseApiService {
  private static readonly ENDPOINTS = {
    patients: '/patients',
    patientById: (id: number) => `/patients/${id}`,
    patientStats: '/patients/stats',
    patientSearch: '/patients/search',
    assignMedecin: (patientId: number) => `/patients/${patientId}/assign-medecin`,
  };

  /**
   * Récupération de tous les patients avec pagination
   */
  static async getPatients(
    page = 1, 
    limit = 10, 
    filters?: SearchFilters
  ): Promise<PaginatedResponse<Patient>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return this.get<PaginatedResponse<Patient>>(`${this.ENDPOINTS.patients}?${params}`);
  }

  /**
   * Récupération d'un patient par ID
   */
  static async getPatientById(id: number): Promise<Patient> {
    return this.get<Patient>(this.ENDPOINTS.patientById(id));
  }

  /**
   * Création d'un nouveau patient
   */
  static async createPatient(patientData: NewPatient): Promise<Patient> {
    return this.post<Patient>(this.ENDPOINTS.patients, patientData);
  }

  /**
   * Mise à jour d'un patient
   */
  static async updatePatient(patientData: UpdatePatient): Promise<Patient> {
    return this.put<Patient>(this.ENDPOINTS.patientById(patientData.id), patientData);
  }

  /**
   * Suppression d'un patient
   */
  static async deletePatient(id: number): Promise<void> {
    return this.delete<void>(this.ENDPOINTS.patientById(id));
  }

  /**
   * Recherche de patients
   */
  static async searchPatients(
    query: string, 
    filters?: SearchFilters
  ): Promise<Patient[]> {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    });

    return this.get<Patient[]>(`${this.ENDPOINTS.patientSearch}?${params}`);
  }

  /**
   * Assignation d'un médecin à un patient
   */
  static async assignMedecinToPatient(patientId: number, medecinId: number): Promise<Patient> {
    return this.post<Patient>(this.ENDPOINTS.assignMedecin(patientId), { medecinId });
  }

  /**
   * Récupération des statistiques des patients
   */
  static async getPatientStats(): Promise<PatientStats> {
    return this.get<PatientStats>(this.ENDPOINTS.patientStats);
  }

  /**
   * Récupération des patients d'un médecin spécifique
   */
  static async getPatientsByMedecin(medecinId: number): Promise<Patient[]> {
    return this.get<Patient[]>(`/medecins/${medecinId}/patients`);
  }
}
