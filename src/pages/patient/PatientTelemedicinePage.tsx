import { useState, useEffect, useCallback, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { telemedicineAPI } from '../../services/telemedicineService';
import { TelemedicineSession } from '../../types/telemedecine';
import SessionCard from '../../components/telemedecine/SessionCard';
import PageMeta from '../../components/common/PageMeta';
import { TimeIcon } from '../../icons';

export default function PatientTelemedicinePage(): ReactElement {
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState<TelemedicineSession[]>([]);
  const [historySessions, setHistorySessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const patientId = parseInt(localStorage.getItem("userId") || "0");

  // Redirection si pas d'ID patient
  useEffect(() => {
    if (!patientId) {
      navigate('/login');
      return;
    }
  }, [patientId, navigate]);

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
    if (patientId) {
      loadSessions();
    }
  }, [patientId, loadSessions]);

  const handleJoinSession = async (sessionId: number) => {
    try {
      await telemedicineAPI.joinSession(sessionId);
      toast.success('Session rejointe avec succès !');
      // Naviguer vers la salle de session
      navigate(`/call/${sessionId}`);
    } catch (error: unknown) {
      console.error('Erreur lors de la connexion:', error);
      let message = "Vous ne pouvez rejoindre la session que quelques minutes avant l'heure prévue et pendant sa durée.";
      if (typeof error === 'object' && error !== null) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message) {
          message = err.response.data.message;
        }
      }
      toast.error(message);
    }
  };

  const handleDeleteSession = async () => {
    toast.warning('Vous ne pouvez pas supprimer cette session');
  };

  const getCurrentSessions = () => {
    return activeTab === 'upcoming' ? upcomingSessions : historySessions;
  };

  const currentSessions = getCurrentSessions();

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <PageMeta
        title="Patient - Télémédecine"
        description="Vos consultations en ligne"
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
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes Consultations en Ligne</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rejoignez vos sessions de télémédecine.</p>
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
                Consultations à venir ({upcomingSessions.length})
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
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucune consultation {activeTab === 'upcoming' ? 'à venir' : 'dans l\'historique'}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{activeTab === 'upcoming' ? "Vous n'avez pas de consultation programmée pour le moment." : 'Aucune consultation terminée pour le moment.'}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Contactez votre médecin pour programmer une consultation en ligne.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onDelete={handleDeleteSession}
                    userRole="patient"
                    layout="horizontal"
                    isHistory={activeTab === 'history'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer 
        position="top-right" 
        style={{ zIndex: 100000 }}
      />
    </div>
  );
}
