import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { usePatients } from '../../hooks/usePatients';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import AffectationModal from '../../components/admin/AffectationModal';
import { Patient } from '../../types';
import StatCard from '../../components/common/StatCard';
import { GroupIcon, CheckCircleIcon, AlertIcon, UserCircleIcon } from '../../icons';
import { PatientAdminService } from '../../services/patientAdminService';
import ContactAvatar from '../../components/messaging/ContactAvatar';

const PatientsAdminPage: React.FC = () => {
  const { patients, medecins, loading, error, refetch, affecterPatient, desaffecterPatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [openAffectModal, setOpenAffectModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-doctor' | 'without-doctor'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Filtrage des patients
  const filteredPatients = useMemo(() => {
    let filtered = patients.filter(patient =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.profession.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus === 'with-doctor') {
      filtered = filtered.filter(patient => patient.medecin);
    } else if (filterStatus === 'without-doctor') {
      filtered = filtered.filter(patient => !patient.medecin);
    }

    return filtered;
  }, [patients, searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  // Statistiques
  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const patientsAvecMedecin = patients.filter(p => p.medecin).length;
    const patientsSansMedecin = totalPatients - patientsAvecMedecin;
    
    return {
      total: totalPatients,
      avecMedecin: patientsAvecMedecin,
      sansMedecin: patientsSansMedecin
    };
  }, [patients]);

  const handleAffecter = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenAffectModal(true);
  };

  const handleDesaffecter = async (patientId: number) => {
    try {
      await desaffecterPatient(patientId);
    } catch (error) {
      console.error('Erreur lors de la désaffectation:', error);
    }
  };

  const handleConfirmAffectation = async (medecinId: number) => {
    if (!selectedPatient) return;

    try {
      await affecterPatient(selectedPatient.id, medecinId);
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
    }
  };

  const handleBloquerPatient = async (id: number) => {
    try {
      await PatientAdminService.bloquerPatient(id);
      refetch(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du blocage:', error);
      alert('Erreur lors du blocage du patient');
    }
  };

  const handleDebloquerPatient = async (id: number) => {
    try {
      await PatientAdminService.debloquerPatient(id);
      refetch(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du déblocage:', error);
      alert('Erreur lors du déblocage du patient');
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Gestion des Patients | Admin" description="Gestion administrative des patients" />
        <LoadingSpinner 
          size="large" 
          text="Chargement des données des patients..." 
          className="min-h-[400px]"
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta title="Gestion des Patients | Admin" description="Gestion administrative des patients" />
        <ErrorAlert 
          message={error} 
          onRetry={refetch}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title="Gestion des Patients | Admin" description="Gestion administrative des patients" />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          {/* Header unifié */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                <GroupIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des Patients</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Administration et affectation des patients aux médecins.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" placeholder="Rechercher un patient..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <select
                aria-label="Filtrer par statut d'affectation"
                title="Filtrer par statut d'affectation"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as 'all' | 'with-doctor' | 'without-doctor'); setCurrentPage(1); }}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les patients</option>
                <option value="with-doctor">Avec médecin</option>
                <option value="without-doctor">Sans médecin</option>
              </select>
            </div>
          </div>

          {/* Statistiques */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Patients" value={stats.total} icon={<UserCircleIcon className="w-5 h-5" />} color="blue" />
              <StatCard title="Avec Médecin" value={stats.avecMedecin} icon={<CheckCircleIcon className="w-5 h-5" />} color="green" />
              <StatCard title="Sans Médecin" value={stats.sansMedecin} icon={<AlertIcon className="w-5 h-5" />} color="yellow" />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="px-6 py-6">
            {paginatedPatients.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun patient trouvé</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedPatients.map(patient => (
                  <div key={patient.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-500 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <ContactAvatar 
                          nom={patient.nom} 
                          photoUrl={patient.photoUrl} 
                          size="lg" 
                        />
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{patient.nom}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{patient.profession}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex-shrink-0">
                          {patient.medecin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>Affecté</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>Non affecté</span>
                          )}
                        </div>
                        {patient.estBloque && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              Bloqué
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span className="truncate">{patient.email}</span></div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><span>{patient.telephone}</span></div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0 4 4 0 018 0z" /></svg><span>{new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}</span></div>
                      {patient.medecin && <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-blue-600 dark:text-blue-400 font-medium">{patient.medecin.nom}</span></div>}
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-600 space-y-2">
                      {patient.medecin ? (
                        <button onClick={() => handleDesaffecter(patient.id)} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>Désaffecter</button>
                      ) : (
                        <button onClick={() => handleAffecter(patient)} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>Affecter un médecin</button>
                      )}
                      
                      {/* Boutons de blocage/déblocage */}
                      {patient.estBloque ? (
                        <button 
                          onClick={() => handleDebloquerPatient(patient.id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Débloquer
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBloquerPatient(patient.id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Bloquer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Précédent</button>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Suivant</button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> sur <span className="font-medium">{filteredPatients.length}</span> résultats</p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      aria-label="Page précédente"
                      title="Page précédente"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    ><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg></button>
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNumber: number;
                      if (totalPages <= 5) pageNumber = index + 1; else if (currentPage <= 3) pageNumber = index + 1; else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + index; else pageNumber = currentPage - 2 + index;
                      return (
                        <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${pageNumber === currentPage ? 'z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm' : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}>{pageNumber}</button>
                      );
                    })}
                    <button
                      type="button"
                      aria-label="Page suivante"
                      title="Page suivante"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    ><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <AffectationModal isOpen={openAffectModal} onClose={() => { setOpenAffectModal(false); setSelectedPatient(null); }} patient={selectedPatient} medecins={medecins} onConfirm={handleConfirmAffectation} />
      </div>
    </>
  );
};

export default PatientsAdminPage;
