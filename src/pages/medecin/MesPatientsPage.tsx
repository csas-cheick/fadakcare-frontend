import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import { useMedecinPatients } from '../../hooks/useMedecinPatients';
import StatCard from '../../components/common/StatCard';
import { UserCircleIcon, DocsIcon, CheckCircleIcon } from '../../icons';
import ContactAvatar from '../../components/messaging/ContactAvatar';

const MesPatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const medecinId = parseInt(localStorage.getItem('userId') || '0');

  const { patients, loading, error } = useMedecinPatients(medecinId);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nom' | 'dateNaissance' | 'nombreDepistages'>('nom');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  React.useEffect(() => {
    if (!medecinId) navigate('/login');
  }, [medecinId, navigate]);

  const filteredAndSortedPatients = useMemo(() => {
    const filtered = patients.filter(p =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return a.nom.localeCompare(b.nom);
        case 'dateNaissance':
          return new Date(a.dateNaissance).getTime() - new Date(b.dateNaissance).getTime();
        case 'nombreDepistages':
          return (b.nombreDepistages || 0) - (a.nombreDepistages || 0);
        default:
          return 0;
      }
    });
    return filtered;
  }, [patients, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() =>
    filteredAndSortedPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredAndSortedPatients, currentPage, itemsPerPage]
  );

  const stats = useMemo(() => {
    const total = patients.length;
    const totalDepistages = patients.reduce((sum, p) => sum + (p.nombreDepistages || 0), 0);
    const avgDepistages = total ? +(totalDepistages / total).toFixed(1) : 0;
    return { total, totalDepistages, avgDepistages };
  }, [patients]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDepistagesBadgeColor = (count: number) => {
    if (!count) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    if (count < 3) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300';
    if (count < 6) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  };

  const handlePatientClick = (id: number) => {
    navigate(`/medecin/patient/${id}`); // corrigé: route définie dans App.tsx
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <>
      <PageMeta title="Mes Patients | Médecin" description="Liste de mes patients assignés" />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300">
                <UserCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes Patients</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gestion et suivi de vos patients assignés.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <select
                aria-label="Trier les patients"
                title="Trier les patients"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="nom">Trier par nom</option>
                <option value="dateNaissance">Trier par âge</option>
                <option value="nombreDepistages">Trier par dépistages</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Mes Patients" value={stats.total} icon={<UserCircleIcon className="w-6 h-6" />} color="teal" />
              <StatCard title="Total Dépistages" value={stats.totalDepistages} icon={<DocsIcon className="w-6 h-6" />} color="blue" />
              <StatCard title="Moy. Dépistages" value={stats.avgDepistages} icon={<CheckCircleIcon className="w-6 h-6" />} color="emerald" />
            </div>
          </div>

            <div className="p-6">
            {paginatedPatients.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun patient trouvé</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Vous n\'avez pas encore de patients assignés.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedPatients.map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient.id)}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-500 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <ContactAvatar 
                        nom={patient.nom} 
                        photoUrl={patient.photoUrl} 
                        size="xl" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{patient.nom}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Né le {formatDate(patient.dateNaissance)}</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="truncate">{patient.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="truncate">{patient.adresse}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-600">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepistagesBadgeColor(patient.nombreDepistages)}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {patient.nombreDepistages} dépistage{patient.nombreDepistages !== 1 ? 's' : ''}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Précédent</button>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Suivant</button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedPatients.length)}</span> sur <span className="font-medium">{filteredAndSortedPatients.length}</span> patients</p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      aria-label="Page précédente"
                      title="Page précédente"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    ><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg></button>
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNumber: number;
                      if (totalPages <= 5) pageNumber = index + 1; else if (currentPage <= 3) pageNumber = index + 1; else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + index; else pageNumber = currentPage - 2 + index;
                      return (
                        <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${pageNumber === currentPage ? 'z-10 bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm' : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}>{pageNumber}</button>
                      );
                    })}
                    <button
                      type="button"
                      aria-label="Page suivante"
                      title="Page suivante"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    ><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MesPatientsPage;
