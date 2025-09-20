import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageMeta from '../../components/common/PageMeta';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/ui/button/Button';
import { CalenderIcon, UserCircleIcon, CheckCircleIcon, CloseIcon, TimeIcon, ListIcon, RefreshIcon } from '../../icons';

interface RendezVous {
  id: number;
  date: string;
  etat: string;
  motif?: string;
  patient?: {
    nom: string;
    prenom: string;
  };
  medecin?: {
    nom: string;
    prenom: string;
  };
}

const AdminRendezVousPage: React.FC = () => {
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
  const [etatFiltre, setEtatFiltre] = useState<string>('tous');
  const [loading, setLoading] = useState(false);

  const fetchRendezVous = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://fadakcare-backend-1.onrender.com/api/rendezvous');
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des rendez-vous');
      }
      const data = await res.json();
      setRendezVousList(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRendezVous();
  }, [fetchRendezVous]);

  const filteredList = useMemo(() => (
    etatFiltre === 'tous'
      ? rendezVousList
      : rendezVousList.filter(r => r.etat === etatFiltre)
  ), [etatFiltre, rendezVousList]);

  const stats = useMemo(() => {
    const total = rendezVousList.length;
    const enAttente = rendezVousList.filter(r => r.etat === 'en_attente').length;
    const acceptes = rendezVousList.filter(r => r.etat === 'accepté').length;
    const refuses = rendezVousList.filter(r => r.etat === 'refusé').length;
    return { total, enAttente, acceptes, refuses };
  }, [rendezVousList]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (etat: string) => {
    switch (etat) {
      case 'accepté':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/50';
      case 'refusé':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50';
      case 'en_attente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900/50';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (etat: string) => {
    switch (etat) {
      case 'accepté':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'refusé':
        return <CloseIcon className="w-4 h-4" />;
      case 'en_attente':
        return <TimeIcon className="w-4 h-4" />;
      default:
        return <CalenderIcon className="w-4 h-4" />;
    }
  };

  return (
    <>
      <PageMeta title="Gestion des Rendez-vous - Admin" description="Gérez tous les rendez-vous de la plateforme" />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                <CalenderIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des Rendez-vous</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">Supervisez et analysez l'ensemble des rendez-vous planifiés sur la plateforme.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={fetchRendezVous}
                variant="outline"
                className="flex items-center gap-2 text-indigo-600 border-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-900"
                startIcon={<RefreshIcon className="w-4 h-4" />}
              >
                Actualiser
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total" value={stats.total} icon={<ListIcon className="w-5 h-5" />} color="blue" />
              <StatCard title="En attente" value={stats.enAttente} icon={<TimeIcon className="w-5 h-5" />} color="yellow" />
              <StatCard title="Acceptés" value={stats.acceptes} icon={<CheckCircleIcon className="w-5 h-5" />} color="green" />
              <StatCard title="Refusés" value={stats.refuses} icon={<CloseIcon className="w-5 h-5" />} color="red" />
            </div>
          </div>

          {/* Filters + List */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Liste des rendez-vous</h2>
              <div className="flex flex-wrap gap-2">
                {[ 
                  { key: 'tous', label: 'Tous', icon: <ListIcon className="w-4 h-4" /> },
                  { key: 'en_attente', label: 'En attente', icon: <TimeIcon className="w-4 h-4" /> },
                  { key: 'accepté', label: 'Acceptés', icon: <CheckCircleIcon className="w-4 h-4" /> },
                  { key: 'refusé', label: 'Refusés', icon: <CloseIcon className="w-4 h-4" /> }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setEtatFiltre(opt.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      etatFiltre === opt.key
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {opt.icon}
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Chargement...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-14 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <CalenderIcon className="w-14 h-14 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Aucun rendez-vous {etatFiltre !== 'tous' ? `(${etatFiltre.replace('_',' ')})` : 'disponible'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Les rendez-vous apparaîtront ici une fois programmés.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredList.map(rdv => (
                  <div
                    key={rdv.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors bg-white dark:bg-gray-900"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                          <UserCircleIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                          <div className="space-y-2 min-w-0">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Informations</h3>
                            <div className="text-sm space-y-1">
                              <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Date:</span> {formatDate(rdv.date)}</p>
                              <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Patient:</span> {rdv.patient?.prenom} {rdv.patient?.nom}</p>
                              <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Médecin:</span> {rdv.medecin?.prenom} {rdv.medecin?.nom}</p>
                            </div>
                          </div>
                          {rdv.motif && (
                            <div className="space-y-2 min-w-0">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Motif</h4>
                              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line break-words">{rdv.motif}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(rdv.etat)}`}>
                          {getStatusIcon(rdv.etat)}
                          <span className="ml-2 capitalize">{rdv.etat.replace('_',' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default AdminRendezVousPage;
