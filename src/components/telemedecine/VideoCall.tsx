import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../../hooks/useWebRTC';
import { telemedicineAPI } from '../../services/telemedicineService';
import { TelemedicineSession } from '../../types/telemedecine';
import { ProfileService } from '../../services/profileService';
import VideoControls from './VideoControls.tsx';
import ParticipantGrid from './ParticipantGrid.tsx';
import ChatPanel from './ChatPanel.tsx';
import { 
  FiMicOff, 
  FiVideoOff, 
  FiMessageSquare,
  FiUsers
} from 'react-icons/fi';

interface VideoCallProps {
  sessionId?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ sessionId: propSessionId }) => {
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const sessionId = propSessionId || paramSessionId;

  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const hasJoinedCall = useRef(false);

  // Données utilisateur (à récupérer depuis le context d'authentification)
  const userId = localStorage.getItem('userId') || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userName = localStorage.getItem('userName') || 'Utilisateur';

  const {
    callState,
    localVideoRef,
    joinCall,
    leaveCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage
  } = useWebRTC({
    sessionId: sessionId || '',
    userId,
    userName
  });

  // Charger les informations de la session
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setError('ID de session manquant');
        setLoading(false);
        return;
      }

      try {
        const sessionData = await telemedicineAPI.getSession(parseInt(sessionId));
        setSession(sessionData);
        
        // Joindre automatiquement l'appel si la session est en cours
        if ((sessionData.etat === 'en_cours' || sessionData.etat === 'programmé') && !hasJoinedCall.current) {
          hasJoinedCall.current = true;
          await joinCall();
          // Marquer l'utilisateur comme ayant rejoint
          await telemedicineAPI.joinSession(parseInt(sessionId));
        }
      } catch (err) {
        setError('Erreur lors du chargement de la session');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // Retirer joinCall des dépendances pour éviter les reconnexions

  // Fonction pour rediriger vers la page télémédecine selon le rôle
  const redirectToTelemedicinePage = () => {
    const { role } = ProfileService.getCurrentUser();
    
    switch (role) {
      case 'patient':
        navigate('/patient/telemedecine');
        break;
      case 'doctor':
      case 'medecin':
        navigate('/medecin/telemedecine');
        break;
      case 'admin':
        navigate('/admin/telemedecine');
        break;
      default:
        navigate('/patient/telemedecine'); // Fallback par défaut
    }
  };

  // Gérer la fin de l'appel
  const handleEndCall = async () => {
    try {
      if (sessionId) {
        await telemedicineAPI.leaveSession(parseInt(sessionId));
        await telemedicineAPI.updateSessionState(parseInt(sessionId), 'terminé');
      }
    } catch (err) {
      console.error('Erreur lors de la fin de l\'appel:', err);
    } finally {
      // Toujours quitter l'appel et rediriger, même en cas d'erreur
      leaveCall();
      redirectToTelemedicinePage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement de la session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête de la session */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{session?.titre}</h1>
            <p className="text-gray-400 text-sm">
              {session?.participants?.length || 0} participant(s) • 
              {callState.isConnected ? ' Connecté' : ' Déconnecté'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Afficher/masquer les participants"
            >
              <FiUsers className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors relative"
              title="Afficher/masquer le chat"
            >
              <FiMessageSquare className="w-5 h-5" />
              {callState.messages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {callState.messages.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Zone vidéo principale */}
        <div className="flex-1 flex flex-col">
          {/* Grille des participants */}
          <div className="flex-1 p-4">
            <ParticipantGrid
              participants={callState.participants}
              localVideoRef={localVideoRef}
              isVideoOff={callState.isVideoOff}
              isMuted={callState.isMuted}
            />
          </div>

          {/* Contrôles vidéo */}
          <div className="p-6 bg-gray-800 border-t border-gray-700">
            <VideoControls
              isMuted={callState.isMuted}
              isVideoOff={callState.isVideoOff}
              isScreenSharing={callState.isScreenSharing}
              onToggleMute={toggleMute}
              onToggleVideo={toggleVideo}
              onToggleScreenShare={toggleScreenShare}
              onEndCall={handleEndCall}
            />
          </div>
        </div>

        {/* Panneau latéral pour le chat */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <ChatPanel
              messages={callState.messages}
              onSendMessage={sendChatMessage}
              currentUserId={userId}
            />
          </div>
        )}

        {/* Panneau latéral pour les participants */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4">Participants ({callState.participants.length})</h3>
            <div className="space-y-2">
              {callState.participants.map((participant, index) => (
                <div key={`${participant.id}-${index}`} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{participant.name}</p>
                    {participant.isHost && <p className="text-xs text-blue-400">Hôte</p>}
                  </div>
                  <div className="flex space-x-1">
                    {participant.isMuted && <FiMicOff className="w-4 h-4 text-red-400" />}
                    {participant.isVideoOff && <FiVideoOff className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
