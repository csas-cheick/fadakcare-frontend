import { useState, useEffect } from 'react';
import { Medecin, Patient } from '../../types';
import { LoadingSpinner } from '../common';
import { useModal } from '../../context/ModalContext';
import ContactAvatar from '../messaging/ContactAvatar';

interface MedecinDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medecin: Medecin | null;
  fetchPatientsByMedecin: (medecinId: number) => Promise<Patient[]>;
}

function MedecinDetailsModal({
  isOpen,
  onClose,
  medecin,
  fetchPatientsByMedecin
}: MedecinDetailsModalProps) {
  const { setModalOpen } = useModal();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  // Gérer l'état du modal pour cacher le header
  useEffect(() => {
    setModalOpen(isOpen);
    return () => setModalOpen(false);
  }, [isOpen, setModalOpen]);

  useEffect(() => {
    if (isOpen && medecin) {
      const loadPatients = async () => {
        setLoading(true);
        try {
          const data = await fetchPatientsByMedecin(medecin.id);
          setPatients(data);
        } catch (error) {
          console.error('Erreur lors du chargement des patients:', error);
        } finally {
          setLoading(false);
        }
      };
      loadPatients();
    }
  }, [isOpen, medecin, fetchPatientsByMedecin]);

  if (!isOpen || !medecin) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Overlay moderne avec flou */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal moderne */}
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="medecin-modal-title"
        >
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ContactAvatar 
                  nom={medecin.nom} 
                  photoUrl={medecin.photoUrl} 
                  size="xl" 
                />
                <div>
                  <h3 id="medecin-modal-title" className="text-2xl font-bold text-white">
                    Dr. {medecin.nom}
                  </h3>
                  <p className="text-blue-100 text-lg">
                    {medecin.specialite}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la fenêtre des détails du médecin"
                title="Fermer"
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Corps du modal */}
          <div className="bg-white dark:bg-gray-800 px-6 py-6 max-h-[70vh] overflow-y-auto">

            {/* Informations du médecin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informations personnelles
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{medecin.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{medecin.telephone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{new Date(medecin.dateNaissance).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {medecin.adresse && (
                      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                        <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{medecin.adresse}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Informations professionnelles
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span><strong>Service:</strong> {medecin.service}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span><strong>N° Ordre:</strong> {medecin.numeroOrdre}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span><strong>Patients:</strong> {medecin.nombrePatients || patients.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des patients */}
            <div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Patients affectés ({patients.length})
              </h4>
              
              {loading ? (
                <div className="flex justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                  <LoadingSpinner size="medium" text="Chargement des patients..." />
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun patient affecté</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ce médecin n'a pas encore de patients assignés.</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                    {patients.map((patient) => (
                      <li key={patient.id} className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ContactAvatar 
                              nom={patient.nom} 
                              photoUrl={patient.photoUrl} 
                              size="lg" 
                            />
                            <div className="ml-4">
                              <div className="text-base font-semibold text-gray-900 dark:text-white">
                                {patient.nom}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {patient.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {patient.profession}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {patient.telephone}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Footer moderne */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-white dark:bg-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedecinDetailsModal;
