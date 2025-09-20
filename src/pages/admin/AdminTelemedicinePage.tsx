// Telemedecine Admin Page
import { useState, useEffect, useCallback, ReactElement } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { telemedicineAPI } from '../../services/telemedicineService';
import { TelemedicineSession } from '../../types/telemedecine';
import SessionCard from '../../components/telemedecine/SessionCard';
import PageMeta from '../../components/common/PageMeta';
import { TimeIcon } from '../../icons';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Admin Telemedicine Page Component
export default function AdminTelemedicinePage(): ReactElement {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TelemedicineSession[]>([]);
  const [historySessions, setHistorySessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  // Admin ne crée pas de sessions, pas de modal de création
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'history'>('all');
  // Modal de confirmation de suppression
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sessionIdToDelete, setSessionIdToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      
      const [upcoming, history, allSessions] = await Promise.all([
        telemedicineAPI.getUpcomingSessions(),
        telemedicineAPI.getSessionHistory(),
        telemedicineAPI.getAllSessions()
      ]);
      
      setUpcomingSessions(upcoming);
      setHistorySessions(history);
      setSessions(allSessions);
      
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Admin ne crée pas de sessions

  // Admin ne rejoint pas les sessions
  const handleJoinSession = async (_sessionId: number) => {
    // marquer comme utilisé pour éviter l'avertissement TS
    void _sessionId;
    toast.info("Les administrateurs ne peuvent pas rejoindre de sessions.");
  };

  // Ouvrir le modal de confirmation
  const handleDeleteSession = (sessionId: number) => {
    setSessionIdToDelete(sessionId);
    setConfirmOpen(true);
  };

  // Confirmer la suppression
  const performDeleteSession = async () => {
    if (!sessionIdToDelete) return;
    try {
      setIsDeleting(true);
      await telemedicineAPI.deleteSession(sessionIdToDelete);
      toast.success('Session supprimée avec succès');
      setConfirmOpen(false);
      setSessionIdToDelete(null);
      // Recharger les listes
      await loadSessions();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la session');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCurrentSessions = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingSessions;
      case 'history':
        return historySessions;
      case 'all':
      default:
        return sessions;
    }
  };

  const currentSessions = getCurrentSessions();

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <PageMeta
        title="Administration - Télémédecine"
        description="Gérer toutes les sessions de télémédecine"
      />
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          {/* Header unifié */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300">
                <TimeIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Administration - Télémédecine</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gestion et supervision de toutes les sessions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSessions}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Actualiser
              </button>
              {/* Pas de bouton de création pour Admin */}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Toutes les sessions ({sessions.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                À venir ({upcomingSessions.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Historique ({historySessions.length})
              </button>
            </div>
          </div>

          {/* Sessions Grid */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des sessions...</span>
              </div>
            ) : currentSessions.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6V9m-1 0H6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-1z" /></svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucune session {activeTab === 'upcoming' ? 'à venir' : activeTab === 'history' ? 'dans l\'historique' : 'disponible'}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{
                  activeTab === 'all' ? "Aucune session de télémédecine n'a été créée." :
                  activeTab === 'upcoming' ? 'Aucune session programmée pour le moment.' :
                  'Aucune session terminée pour le moment.'
                }</p>
                {/* Admin ne crée pas de sessions */}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onDelete={handleDeleteSession}
          userRole="admin"
                    layout="horizontal"
                    isHistory={activeTab === 'history'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer la session ?"
        description={`Cette action est irréversible. Voulez-vous vraiment supprimer "${sessions.find(s => s.id === sessionIdToDelete)?.titre || 'cette session'}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={isDeleting}
        variant="danger"
        onConfirm={performDeleteSession}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Admin: pas de modal de création */}

      <ToastContainer 
        position="top-right" 
        style={{ zIndex: 100000 }}
      />
    </div>
  );
}

