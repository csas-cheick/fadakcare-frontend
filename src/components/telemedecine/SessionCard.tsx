import React from 'react';
import { TelemedicineSession } from '../../types/telemedecine';

interface SessionCardProps {
  session: TelemedicineSession;
  onJoin: (sessionId: number) => void;
  onDelete: (sessionId: number) => void;
  userRole: string;
  isHistory?: boolean;
  onTerminate?: (sessionId: number) => void;
  layout?: 'vertical' | 'horizontal';
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onJoin,
  onDelete,
  userRole,
  isHistory = false,
  onTerminate,
  layout = 'vertical',
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (etat?: string) => {
    switch (etat) {
      case 'programmé':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'en_cours':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'terminé':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
      case 'annulé':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
    }
  };

  const getStatusText = (etat?: string) => {
    switch (etat) {
      case 'programmé':
        return 'Programmé';
      case 'en_cours':
        return 'En cours';
      case 'terminé':
        return 'Terminé';
      case 'annulé':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const getTypeText = (type?: string) => {
    switch (type) {
      case 'medecin_patient':
        return 'Consultation individuelle';
      case 'medecin_patients':
        return 'Consultation de groupe';
      case 'medecin_medecin':
        return 'Réunion médicale';
      default:
        return 'Type inconnu';
    }
  };

  const canJoin = () => {
    if (isHistory) return false;
    const now = new Date();
    const sessionStart = new Date(session.dateDebut);
    const sessionEnd = new Date(sessionStart.getTime() + session.duree * 60000);

    if (userRole === 'patient') {
      const windowStart = new Date(sessionStart.getTime() - 5 * 60 * 1000);
      return now >= windowStart && now < sessionEnd;
    }

    if (userRole === 'medecin') {
      return session.etat === 'programmé' || (session.etat === 'en_cours' && now < sessionEnd);
    }

    return false; // admin or others do not join
  };

  const isLive = () => {
    return session.etat === 'en_cours';
  };

  return (
    <div className={`rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700`}>
  <div className={`flex ${layout === 'horizontal' || isHistory ? 'flex-col md:flex-row md:items-start md:justify-between md:gap-6' : 'items-start justify-between'} mb-4`}>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {session.titre || 'Session sans titre'}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.etat)}`}>
              {getStatusText(session.etat)}
            </span>
            {isLive() && (
              <span className="flex items-center px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full text-xs font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                En direct
              </span>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{getTypeText(session.type)}</p>
          
          {session.description && (
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{session.description}</p>
          )}
        </div>
        
        <div className={`flex items-center space-x-2 ${isHistory ? 'mt-2 md:mt-0' : ''}`}>
          {/* Patient: always show a button for programmé/en_cours; disable outside time window */}
          {userRole === 'patient' && !isHistory && (session.etat === 'programmé' || session.etat === 'en_cours') && (
            <button
              onClick={() => onJoin(session.id)}
              disabled={!canJoin()}
              title={!canJoin() ? "Disponible 5 min avant l'heure prévue et pendant la durée" : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isLive() ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Rejoindre
            </button>
          )}

          {/* Médecin: show Join/Démarrer when allowed */}
          {userRole === 'medecin' && !isHistory && canJoin() && (
            <button
              onClick={() => onJoin(session.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLive() ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLive() ? 'Rejoindre' : 'Démarrer'}
            </button>
          )}

          {/* Terminer: only for medecin when session is live */}
          {userRole === 'medecin' && session.etat === 'en_cours' && !isHistory && onTerminate && (
            <button
              onClick={() => onTerminate(session.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-800 text-white"
              title="Terminer la session"
            >
              Terminer
            </button>
          )}
          
          {(userRole === 'medecin' || userRole === 'admin') && !isHistory && (
            <button
              onClick={() => onDelete(session.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors dark:text-gray-500"
              title="Supprimer la session"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

  {/* Details: grid by default, horizontal when layout is horizontal or history */}
  {layout === 'horizontal' || isHistory ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1a1 1 0 001 1h4a1 1 0 001-1V7m-6 0H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V8a1 1 0 00-1-1h-4" />
            </svg>
            <span>{formatDate(session.dateDebut)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(session.dateDebut)} ({session.duree} min)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{session.participants?.length || 0} participant(s)</span>
          </div>
        </div>
  ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1a1 1 0 001 1h4a1 1 0 001-1V7m-6 0H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V8a1 1 0 00-1-1h-4" />
            </svg>
            <span>{formatDate(session.dateDebut)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(session.dateDebut)} ({session.duree} min)</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{session.participants?.length || 0} participant(s)</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          {(userRole === 'admin' || userRole === 'patient') && (
            <span>Créé par {session.createurNom || 'Médecin'}</span>
          )}
          {userRole === 'doctor' && <span></span>}
          <span>ID: #{session.id}</span>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
