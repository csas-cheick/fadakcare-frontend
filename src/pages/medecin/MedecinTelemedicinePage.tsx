import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { telemedicineAPI } from '../../services/telemedicineService';
import { TelemedicineSession, CreateSessionRequest } from '../../types/telemedecine';
import CreateSessionModal from '../../components/telemedecine/CreateSessionModal';
import SessionCard from '../../components/telemedecine/SessionCard';
import PageMeta from '../../components/common/PageMeta';
import { TimeIcon } from '../../icons';

export default function MedecinTelemedicinePage(): ReactElement {
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState<TelemedicineSession[]>([]);
  const [historySessions, setHistorySessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const medecinId = parseInt(localStorage.getItem("userId") || "0");

  // Redirection si pas d'ID médecin
  React.useEffect(() => {
    if (!medecinId) {
      navigate('/login');
      return;
    }
  }, [medecinId, navigate]);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const all = await telemedicineAPI.getMySessions();
      const now = new Date();
      const upcoming = all
        .filter(s => {
          const start = new Date(s.dateDebut);
          return (s.etat === 'programmé' && start >= now) || s.etat === 'en_cours';
        })
        .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
      const history = all
        .filter(s => {
          const start = new Date(s.dateDebut);
          return s.etat === 'terminé' || s.etat === 'annulé' || (s.etat === 'programmé' && start < now);
        })
        .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());
      setUpcomingSessions(upcoming);
      setHistorySessions(history);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (medecinId) {
      loadSessions();
    }
  }, [medecinId, loadSessions]);

  const handleCreateSession = async (data: CreateSessionRequest) => {
    try {
      await telemedicineAPI.createSession(data);
      toast.success('Session créée avec succès');
      setShowCreateModal(false);
      loadSessions();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la session');
    }
  };

  const handleJoinSession = async (sessionId: number) => {
    try {
      await telemedicineAPI.joinSession(sessionId);
      toast.success('Session rejointe avec succès !');
      // Naviguer vers la salle de session
      navigate(`/call/${sessionId}`);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      toast.error('Erreur lors de la connexion à la session');
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      try {
        await telemedicineAPI.deleteSession(sessionId);
        toast.success('Session supprimée avec succès');
        loadSessions();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de la session');
      }
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    try {
      await telemedicineAPI.updateSessionState(sessionId, 'terminé');
      toast.success('Session terminée');
      loadSessions();
    } catch (error) {
      console.error('Erreur lors de la terminaison:', error);
      toast.error('Impossible de terminer la session');
    }
  };

  const getCurrentSessions = () => {
    return activeTab === 'upcoming' ? upcomingSessions : historySessions;
  };

  const currentSessions = getCurrentSessions();

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <PageMeta
        title="Médecin - Télémédecine"
        description="Gérer vos sessions de télémédecine"
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
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes Sessions de Télémédecine</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Créez et gérez vos consultations en ligne.</p>
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
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Créer une session
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sessions à venir ({upcomingSessions.length})
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
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucune session {activeTab === 'upcoming' ? 'à venir' : 'dans l\'historique'}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{activeTab === 'upcoming' ? "Vous n'avez pas de session programmée pour le moment." : 'Aucune session terminée pour le moment.'}</p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Créer votre première session
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onDelete={handleDeleteSession}
                    userRole="medecin"
                    onTerminate={handleTerminateSession}
                    layout="horizontal"
                    isHistory={activeTab === 'history'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSession}
        />
      )}

      <ToastContainer 
        position="top-right" 
        style={{ zIndex: 100000 }}
      />
    </div>
  );
}
