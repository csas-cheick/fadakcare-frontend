import React, { useEffect, useRef } from 'react';
import { CallParticipant } from '../../types/telemedecine';

interface ParticipantGridProps {
  participants: CallParticipant[];
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  isVideoOff: boolean;
  isMuted: boolean;
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  participants,
  localVideoRef,
  isVideoOff,
  isMuted
}) => {
  // Séparer les participants locaux et distants
  const localParticipant = participants.find(p => p.isLocal);
  const remoteParticipants = participants.filter(p => !p.isLocal);
  
  const getGridClass = (participantCount: number) => {
    if (participantCount === 0) return 'grid-cols-1';
    if (participantCount === 1) return 'grid-cols-1 md:grid-cols-2';
    if (participantCount <= 4) return 'grid-cols-2';
    if (participantCount <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  const totalParticipants = participants.length;

  return (
    <div className={`grid gap-4 h-full ${getGridClass(totalParticipants)}`}>
      {/* Vidéo locale */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden">
        {!isVideoOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-2">
                {localParticipant?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <p className="text-gray-300 text-sm">Vidéo désactivée</p>
            </div>
          </div>
        )}
        
        {/* Indicateurs d'état */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {isMuted && (
            <div className="bg-red-500 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            </div>
          )}
          {isVideoOff && (
            <div className="bg-red-500 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            </div>
          )}
        </div>

        {/* Nom du participant */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
          Vous
        </div>
      </div>

      {/* Vidéos des participants distants */}
      {remoteParticipants.map((participant, index) => (
        <ParticipantVideo key={`${participant.id}-${index}`} participant={participant} />
      ))}
    </div>
  );
};

interface ParticipantVideoProps {
  participant: CallParticipant;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({ participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      {participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-2">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-gray-300 text-sm">
              {participant.isVideoOff ? 'Vidéo désactivée' : 'Connexion...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Indicateurs d'état */}
      <div className="absolute top-3 left-3 flex space-x-2">
        {participant.isHost && (
          <div className="bg-blue-500 rounded-full px-2 py-1">
            <span className="text-white text-xs font-semibold">Hôte</span>
          </div>
        )}
        {participant.isMuted && (
          <div className="bg-red-500 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          </div>
        )}
        {participant.isVideoOff && (
          <div className="bg-red-500 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          </div>
        )}
      </div>

      {/* Nom du participant */}
      <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
        {participant.name}
      </div>
    </div>
  );
};

export default ParticipantGrid;
