import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import StatCard from '../../components/common/StatCard';
import { TimeIcon, CheckCircleIcon, CloseIcon, ListIcon } from '../../icons';

interface RendezVous {
  id: number;
  date: string;
  etat: string;
  patientId: number;
  motif?: string;
  patient?: {
    nom: string;
  };
}

// Constante pour l'URL du backend
const BACKEND_URL = 'https://fadakcare-backend-1.onrender.com/api';

const MedecinRendezVousPage: React.FC = () => {
  const navigate = useNavigate();
  const medecinId = parseInt(localStorage.getItem("userId") || "0");
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
  const [etatFiltre, setEtatFiltre] = useState<string>('en_attente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Redirection si pas d'ID médecin
  React.useEffect(() => {
    if (!medecinId) {
      navigate('/login');
    }
  }, [medecinId, navigate]);

  const fetchRendezVous = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/rendezvous/medecin/${medecinId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setRendezVousList([]);
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRendezVousList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, [medecinId]);

  useEffect(() => {
    if (medecinId) {
      fetchRendezVous();
    }
  }, [medecinId, fetchRendezVous]);

  const handleEtatChange = async (id: number, nouvelEtat: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${BACKEND_URL}/rendezvous/${id}/etat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouvelEtat),
      });
      
      if (res.ok) {
        await fetchRendezVous(); // Recharger la liste
      } else {
        setError("Échec de la mise à jour du rendez-vous");
      }
    } catch {
      setError("Erreur de communication avec le serveur");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) 
        ? dateStr 
        : new Intl.DateTimeFormat('fr-FR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Filtrage et statistiques
  const filteredList = useMemo(() => {
    return rendezVousList.filter(rdv => rdv.etat === etatFiltre);
  }, [rendezVousList, etatFiltre]);

  const stats = useMemo(() => {
    const enAttente = rendezVousList.filter(rdv => rdv.etat === 'en_attente').length;
    const acceptes = rendezVousList.filter(rdv => rdv.etat === 'accepté').length;
    const refuses = rendezVousList.filter(rdv => rdv.etat === 'refusé').length;
    
    return { enAttente, acceptes, refuses, total: rendezVousList.length };
  }, [rendezVousList]);

  const getEtatBadgeColor = (etat: string) => {
    switch (etat) {
      case 'accepté':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'refusé':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // (Old gradient button style helper removed after unified layout refactor)

  if (loading) {
    return (
      <>
        <PageMeta title="Rendez-vous | Médecin" description="Gestion des rendez-vous médecin" />
        <LoadingSpinner 
          size="large" 
          text="Chargement des rendez-vous..." 
          className="min-h-[400px]"
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title="Rendez-vous | Médecin" description="Gestion des rendez-vous médecin" />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          {/* Header unifié */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300">
                <TimeIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des Rendez-vous</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Consultez et gérez vos rendez-vous patients.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEtatFiltre('en_attente')} className={`px-3 py-2 rounded-lg text-sm font-medium border ${etatFiltre==='en_attente' ? 'bg-teal-600 border-teal-600 text-white shadow-sm':'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>En attente ({stats.enAttente})</button>
              <button onClick={() => setEtatFiltre('accepté')} className={`px-3 py-2 rounded-lg text-sm font-medium border ${etatFiltre==='accepté' ? 'bg-green-600 border-green-600 text-white shadow-sm':'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Acceptés ({stats.acceptes})</button>
              <button onClick={() => setEtatFiltre('refusé')} className={`px-3 py-2 rounded-lg text-sm font-medium border ${etatFiltre==='refusé' ? 'bg-red-600 border-red-600 text-white shadow-sm':'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Refusés ({stats.refuses})</button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <StatCard title="Total" value={stats.total} icon={<ListIcon className="w-5 h-5" />} color="blue" />
              <StatCard title="En attente" value={stats.enAttente} icon={<TimeIcon className="w-5 h-5" />} color="yellow" />
              <StatCard title="Acceptés" value={stats.acceptes} icon={<CheckCircleIcon className="w-5 h-5" />} color="green" />
              <StatCard title="Refusés" value={stats.refuses} icon={<CloseIcon className="w-5 h-5" />} color="red" />
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="px-6 pt-4">
              <ErrorAlert message={error} onRetry={fetchRendezVous} />
            </div>
          )}

          {/* Liste */}
          <div className="px-6 py-6">
            {filteredList.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6V9m-1 0H6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-1z" /></svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun rendez-vous {etatFiltre === 'en_attente' ? 'en attente' : etatFiltre}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{etatFiltre === 'en_attente' ? 'Vous n\'avez pas de nouvelles demandes de rendez-vous.' : `Aucun rendez-vous ${etatFiltre} pour le moment.`}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredList.map(rdv => (
                  <div key={rdv.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 hover:border-teal-300 dark:hover:border-teal-600 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center text-white text-lg font-semibold">{rdv.patient?.nom?.charAt(0).toUpperCase() || 'P'}</div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{rdv.patient?.nom || 'Patient inconnu'}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(rdv.date)}</p>
                          </div>
                        </div>
                        {rdv.motif && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Motif :</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 whitespace-pre-line">{rdv.motif}</p>
                          </div>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEtatBadgeColor(rdv.etat)}`}>
                          {rdv.etat === 'en_attente' && <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          {rdv.etat === 'accepté' && <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                          {rdv.etat === 'refusé' && <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                          {rdv.etat.charAt(0).toUpperCase() + rdv.etat.slice(1)}
                        </span>
                      </div>
                      {etatFiltre === 'en_attente' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button onClick={() => handleEtatChange(rdv.id, 'accepté')} disabled={actionLoading === rdv.id} className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            {actionLoading === rdv.id ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <CheckCircleIcon className="w-4 h-4 mr-1" />}
                            Accepter
                          </button>
                          <button onClick={() => handleEtatChange(rdv.id, 'refusé')} disabled={actionLoading === rdv.id} className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            {actionLoading === rdv.id ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <CloseIcon className="w-4 h-4 mr-1" />}
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MedecinRendezVousPage;
