import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { useMedecins } from '../../hooks/useMedecins';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import AddMedecinModal from '../../components/admin/AddMedecinModal';
import MedecinDetailsModal from '../../components/admin/MedecinDetailsModal';
import { Medecin, NewMedecin } from '../../types';
import StatCard from '../../components/common/StatCard';
import { UserCircleIcon, DocsIcon, AlertIcon } from '../../icons';
import { MedecinAdminService } from '../../services/medecinAdminService';
import ContactAvatar from '../../components/messaging/ContactAvatar';

const MedecinsAdminPage: React.FC = () => {
  const { 
    medecins, 
    loading, 
    error, 
    addMedecin, 
    fetchPatientsByMedecin, 
    refetch 
  } = useMedecins();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null);
  const [filterSpecialite, setFilterSpecialite] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Filtrage des médecins
  const filteredMedecins = useMemo(() => {
    let filtered = medecins.filter(medecin =>
      medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.service.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterSpecialite !== 'all') {
      filtered = filtered.filter(medecin => medecin.specialite === filterSpecialite);
    }

    return filtered;
  }, [medecins, searchTerm, filterSpecialite]);

  // Pagination
  const totalPages = Math.ceil(filteredMedecins.length / itemsPerPage);
  const paginatedMedecins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedecins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedecins, currentPage, itemsPerPage]);

  // Statistiques
  const stats = useMemo(() => {
    const totalMedecins = medecins.length;
    const totalPatients = medecins.reduce((sum, m) => sum + (m.nombrePatients || 0), 0);
    const specialites = [...new Set(medecins.map(m => m.specialite))].length;
    
    return {
      total: totalMedecins,
      totalPatients,
      specialites
    };
  }, [medecins]);

  // Spécialités uniques pour le filtre
  const specialitesUniques = useMemo(() => {
    return [...new Set(medecins.map(m => m.specialite))].sort();
  }, [medecins]);

  const handleVoirDetails = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setOpenDetailsModal(true);
  };

  const handleAddMedecin = async (medecinData: NewMedecin) => {
    try {
      await addMedecin(medecinData);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      throw error;
    }
  };

  const handleBloquerMedecin = async (id: number) => {
    try {
      await MedecinAdminService.bloquerMedecin(id);
      refetch(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du blocage:', error);
      alert('Erreur lors du blocage du médecin');
    }
  };

  const handleDebloquerMedecin = async (id: number) => {
    try {
      await MedecinAdminService.debloquerMedecin(id);
      refetch(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du déblocage:', error);
      alert('Erreur lors du déblocage du médecin');
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Gestion des Médecins | Admin" description="Gestion administrative des médecins" />
        <LoadingSpinner 
          size="large" 
          text="Chargement des données des médecins..." 
          className="min-h-[400px]"
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta title="Gestion des Médecins | Admin" description="Gestion administrative des médecins" />
        <ErrorAlert 
          message={error} 
          onRetry={refetch}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title="Gestion des Médecins | Admin" description="Gestion administrative des médecins" />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          {/* Header unifié */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
                <UserCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des Médecins</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Administration du personnel médical et suivi des affectations.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                <input type="text" placeholder="Rechercher un médecin..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <select
                aria-label="Filtrer par spécialité"
                title="Filtrer par spécialité"
                value={filterSpecialite}
                onChange={(e) => { setFilterSpecialite(e.target.value); setCurrentPage(1); }}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Toutes les spécialités</option>
                {specialitesUniques.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => setOpenAddModal(true)} className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>
                Ajouter
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Médecins" value={stats.total} icon={<UserCircleIcon className="w-5 h-5" />} color="emerald" />
              <StatCard title="Patients Suivis" value={stats.totalPatients} icon={<DocsIcon className="w-5 h-5" />} color="blue" />
              <StatCard title="Spécialités" value={stats.specialites} icon={<AlertIcon className="w-5 h-5" />} color="purple" />
            </div>
          </div>

          {/* Liste des médecins */}
          <div className="px-6 py-6">
            {paginatedMedecins.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun médecin trouvé</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedMedecins.map(m => (
                  <div key={m.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-500 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <ContactAvatar 
                          nom={m.nom} 
                          photoUrl={m.photoUrl} 
                          size="lg" 
                        />
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{m.nom}</h3>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">{m.specialite}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{m.nombrePatients || 0} patients</span>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><span className="truncate">{m.service}</span></div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span className="truncate">{m.email}</span></div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><span>{m.telephone}</span></div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><span>N° {m.numeroOrdre}</span></div>
                    </div>
                    
                    {/* Statut de blocage */}
                    {m.estBloque && (
                      <div className="mb-3 flex items-center text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Compte bloqué
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-600 space-y-2">
                      <button onClick={() => handleVoirDetails(m)} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir détails
                      </button>
                      
                      {/* Bouton de blocage/déblocage */}
                      {m.estBloque ? (
                        <button 
                          onClick={() => handleDebloquerMedecin(m.id)} 
                          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Débloquer
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBloquerMedecin(m.id)} 
                          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
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
                  <p className="text-sm text-gray-700 dark:text-gray-300">Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredMedecins.length)}</span> sur <span className="font-medium">{filteredMedecins.length}</span> résultats</p>
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
                        <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${pageNumber === currentPage ? 'z-10 bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-sm' : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}>{pageNumber}</button>
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
        <AddMedecinModal isOpen={openAddModal} onClose={() => setOpenAddModal(false)} onConfirm={handleAddMedecin} />
        <MedecinDetailsModal isOpen={openDetailsModal} onClose={() => { setOpenDetailsModal(false); setSelectedMedecin(null); }} medecin={selectedMedecin} fetchPatientsByMedecin={fetchPatientsByMedecin} />
      </div>
    </>
  );
};

export default MedecinsAdminPage;
