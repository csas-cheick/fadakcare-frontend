import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VideoCallState, CallParticipant, ChatMessage } from '../types/telemedecine';

interface UseWebRTCOptions {
  sessionId: string;
  userId: string;
  userName: string;
  isHost?: boolean;
}

// Types pour les messages WebSocket
interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

interface UserJoinedMessage extends WebSocketMessage {
  type: 'user-joined';
  userId: string;
  userName: string;
  isHost: boolean;
}

interface UserLeftMessage extends WebSocketMessage {
  type: 'user-left';
  userId: string;
  userName: string;
}

interface OfferMessage extends WebSocketMessage {
  type: 'offer';
  offer: RTCSessionDescriptionInit;
  fromId: string;
  targetId?: string;
}

interface AnswerMessage extends WebSocketMessage {
  type: 'answer';
  answer: RTCSessionDescriptionInit;
  fromId: string;
  targetId?: string;
}

interface IceCandidateMessage extends WebSocketMessage {
  type: 'ice-candidate';
  candidate: RTCIceCandidate;
  fromId: string;
  targetId?: string;
}

interface ChatMessageData extends WebSocketMessage {
  type: 'chat-message';
  message: string;
  fromId: string;
  senderName: string;
  timestamp?: string;
}

interface ExistingParticipantsMessage extends WebSocketMessage {
  type: 'existing-participants';
  participants: Array<{
    userId: string;
    userName: string;
    isHost: boolean;
  }>;
}

export const useWebRTC = ({
  sessionId,
  userId,
  userName,
  isHost = false
}: UseWebRTCOptions) => {
  const [callState, setCallState] = useState<VideoCallState>({
    isConnected: false,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    participants: [],
    messages: []
  });

  const [isJoining, setIsJoining] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);

  // Configuration WebRTC
  const pcConfig = useMemo<RTCConfiguration>(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }), []);

  // Créer une nouvelle connexion peer
  const createPeerConnection = useCallback((participantId: string) => {
    console.log(`Création d'une connexion peer vers ${participantId}`);
    const pc = new RTCPeerConnection(pcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log(`Envoi d'un candidat ICE vers ${participantId}`);
        socketRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetId: participantId
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log(`Réception d'un flux vidéo de ${participantId}`);
      const [remoteStream] = event.streams;
      
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId 
            ? { ...p, stream: remoteStream }
            : p
        )
      }));
    };

    pc.onconnectionstatechange = () => {
      console.log(`État de connexion avec ${participantId}:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log(`✅ Connexion établie avec ${participantId}`);
      } else if (pc.connectionState === 'failed') {
        console.log(`❌ Échec de connexion avec ${participantId}`);
      }
    };

    // Ajouter le flux local au peer connection
    if (localStreamRef.current) {
      console.log(`Ajout du flux local vers ${participantId}`);
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`Ajout de track ${track.kind} vers ${participantId}`);
        pc.addTrack(track, localStreamRef.current!);
      });
    } else {
      console.warn(`⚠️ Aucun flux local disponible pour ${participantId}`);
    }

    peerConnectionsRef.current.set(participantId, pc);
    return pc;
  }, [pcConfig]);

  // Gérer l'arrivée d'un utilisateur
  const handleUserJoined = useCallback(async (data: UserJoinedMessage) => {
    // Ne pas ajouter l'utilisateur local à nouveau
    if (data.userId === userId) {
      return;
    }

    const newParticipant: CallParticipant = {
      id: data.userId,
      name: data.userName,
      isHost: data.isHost || false,
      isMuted: false,
      isVideoOff: false,
      isLocal: false
    };

    setCallState(prev => {
      // Vérifier si le participant existe déjà pour éviter les doublons
      const existingParticipant = prev.participants.find(p => p.id === data.userId);
      if (existingParticipant) {
        console.log(`Participant ${data.userName} (${data.userId}) existe déjà, ignoré`);
        return prev; // Ne pas ajouter de doublon
      }
      
      console.log(`Ajout du participant ${data.userName} (${data.userId})`);
      return {
        ...prev,
        participants: [...prev.participants, newParticipant]
      };
    });

    // Créer une offre vers le nouveau participant (nous étions déjà connectés)
    console.log(`Création d'une offre vers ${data.userName} (${data.userId})`);
    const pc = createPeerConnection(data.userId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (socketRef.current) {
      console.log(`Envoi d'une offre vers ${data.userId}`);
      socketRef.current.send(JSON.stringify({
        type: 'offer',
        offer: offer,
        targetId: data.userId
      }));
    }
  }, [createPeerConnection, userId]);

  // Gérer le départ d'un utilisateur
  const handleUserLeft = useCallback((data: UserLeftMessage) => {
    const pc = peerConnectionsRef.current.get(data.userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(data.userId);
    }

    setCallState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== data.userId)
    }));
  }, []);

  // Gérer une offre reçue
  const handleOffer = useCallback(async (data: OfferMessage) => {
    console.log(`Réception d'une offre de ${data.fromId}`);
    const pc = createPeerConnection(data.fromId);
    await pc.setRemoteDescription(data.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (socketRef.current) {
      console.log(`Envoi d'une réponse vers ${data.fromId}`);
      socketRef.current.send(JSON.stringify({
        type: 'answer',
        answer: answer,
        targetId: data.fromId
      }));
    }
  }, [createPeerConnection]);

  // Gérer une réponse reçue
  const handleAnswer = useCallback(async (data: AnswerMessage) => {
    console.log(`Réception d'une réponse de ${data.fromId}`);
    const pc = peerConnectionsRef.current.get(data.fromId);
    if (pc) {
      await pc.setRemoteDescription(data.answer);
      console.log(`Réponse appliquée pour ${data.fromId}`);
    } else {
      console.warn(`⚠️ Aucune connexion peer trouvée pour ${data.fromId}`);
    }
  }, []);

  // Gérer un candidat ICE reçu
  const handleIceCandidate = useCallback(async (data: IceCandidateMessage) => {
    console.log(`Réception d'un candidat ICE de ${data.fromId}`);
    const pc = peerConnectionsRef.current.get(data.fromId);
    if (pc) {
      await pc.addIceCandidate(data.candidate);
      console.log(`Candidat ICE ajouté pour ${data.fromId}`);
    } else {
      console.warn(`⚠️ Aucune connexion peer trouvée pour candidat ICE de ${data.fromId}`);
    }
  }, []);

  // Gérer la liste des participants existants
  const handleExistingParticipants = useCallback((data: ExistingParticipantsMessage) => {
    console.log(`Réception de ${data.participants.length} participants existants:`, data.participants);
    
    const newParticipants: CallParticipant[] = data.participants.map(p => ({
      id: p.userId,
      name: p.userName,
      isHost: p.isHost,
      isMuted: false,
      isVideoOff: false,
      isLocal: false
    }));

    setCallState(prev => {
      // Éviter les doublons en filtrant les participants qui existent déjà
      const existingIds = prev.participants.map(p => p.id);
      const uniqueParticipants = newParticipants.filter(p => {
        const isUnique = !existingIds.includes(p.id);
        if (!isUnique) {
          console.log(`Participant existant ${p.name} (${p.id}) ignoré pour éviter doublon`);
        } else {
          console.log(`Ajout du participant existant ${p.name} (${p.id})`);
        }
        return isUnique;
      });
      
      if (uniqueParticipants.length === 0) {
        console.log('Aucun nouveau participant à ajouter');
        return prev;
      }
      
      return {
        ...prev,
        participants: [...prev.participants, ...uniqueParticipants]
      };
    });

    // Créer des connexions peer pour chaque participant existant
    data.participants.forEach(async (participant) => {
      console.log(`Création de connexion peer pour participant existant ${participant.userName} (${participant.userId})`);
      createPeerConnection(participant.userId);
      // Note: Les participants existants vont nous envoyer des offres automatiquement
      // car nous venons de leur envoyer user-joined
    });
  }, [createPeerConnection]);

  // Gérer un message de chat
  const handleChatMessage = useCallback((data: ChatMessageData) => {
    // Ne pas ajouter le message si c'est nous qui l'avons envoyé
    // (il a déjà été ajouté dans sendChatMessage)
    if (data.fromId === userId) {
      return;
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: data.fromId,
      senderName: data.senderName,
      message: data.message,
      timestamp: new Date().toISOString()
    };

    setCallState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, [userId]);

  // Obtenir le flux médias local
  const getLocalStream = useCallback(async (video = true, audio = true) => {
    try {
      console.log('Demande d\'accès aux médias (caméra/micro)...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: audio
      });

      console.log('✅ Flux médias obtenu:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('Flux vidéo local assigné à l\'élément vidéo');
      }

      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès aux médias:', error);
      throw error;
    }
  }, []);

  // Initialiser la connexion WebSocket
  const initializeSocket = useCallback(() => {
    const wsUrl = `ws://localhost:8080?sessionId=${sessionId}&userId=${userId}&userName=${userName}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsJoining(false); // Connexion établie
      setCallState(prev => ({ 
        ...prev, 
        isConnected: true,
        // Ajouter l'utilisateur local à la liste des participants
        participants: [{
          id: userId,
          name: userName,
          isHost: isHost,
          isMuted: false,
          isVideoOff: false,
          isLocal: true
        }]
      }));
      console.log(`Utilisateur local ajouté: ${userName} (${userId}), isHost: ${isHost}`);
    };

    socketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log(`Message WebSocket reçu: ${data.type}`, data);
      
      switch (data.type) {
        case 'user-joined':
          await handleUserJoined(data as UserJoinedMessage);
          break;
        case 'user-left':
          handleUserLeft(data as UserLeftMessage);
          break;
        case 'offer':
          await handleOffer(data as OfferMessage);
          break;
        case 'answer':
          await handleAnswer(data as AnswerMessage);
          break;
        case 'ice-candidate':
          await handleIceCandidate(data as IceCandidateMessage);
          break;
        case 'chat-message':
          handleChatMessage(data as ChatMessageData);
          break;
        case 'existing-participants':
          handleExistingParticipants(data as ExistingParticipantsMessage);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsJoining(false); // Réinitialiser l'état
      setCallState(prev => ({ ...prev, isConnected: false }));
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [sessionId, userId, userName, isHost, handleUserJoined, handleUserLeft, handleOffer, handleAnswer, handleIceCandidate, handleChatMessage, handleExistingParticipants]);

  // Rejoindre l'appel
  const joinCall = useCallback(async () => {
    // Éviter les appels multiples
    if (isJoining || socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('Appel déjà en cours ou connexion déjà établie, ignoré');
      return;
    }

    try {
      console.log('Début de joinCall');
      setIsJoining(true);
      await getLocalStream();
      initializeSocket();
    } catch (error) {
      console.error('Error joining call:', error);
      setIsJoining(false);
      throw error;
    }
  }, [getLocalStream, initializeSocket, isJoining]);

  // Quitter l'appel
  const leaveCall = useCallback(() => {
    console.log('Début de leaveCall');
    
    // Fermer toutes les connexions peer
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    // Arrêter le flux local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Fermer la connexion WebSocket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsJoining(false);
    setCallState({
      isConnected: false,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      participants: [],
      messages: []
    });
  }, []);

  // Activer/désactiver le micro
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  }, []);

  // Activer/désactiver la vidéo
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoOff: !videoTrack.enabled }));
      }
    }
  }, []);

  // Partager l'écran
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        // Remplacer le flux vidéo pour tous les peers
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });

        setCallState(prev => ({ ...prev, isScreenSharing: true }));

        // Écouter la fin du partage d'écran
        videoTrack.onended = () => {
          toggleScreenShare();
        };
      } else {
        // Revenir à la caméra
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        const videoTrack = cameraStream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });

        setCallState(prev => ({ ...prev, isScreenSharing: false }));
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [callState.isScreenSharing]);

  // Envoyer un message de chat
  const sendChatMessage = useCallback((message: string) => {
    if (socketRef.current && message.trim()) {
      // Ajouter immédiatement le message à l'interface locale
      const localMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: userId,
        senderName: userName,
        message: message.trim(),
        timestamp: new Date().toISOString()
      };

      setCallState(prev => ({
        ...prev,
        messages: [...prev.messages, localMessage]
      }));

      // Envoyer le message via WebSocket
      socketRef.current.send(JSON.stringify({
        type: 'chat-message',
        message: message.trim(),
        senderName: userName
      }));
    }
  }, [userName, userId]);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, [leaveCall]);

  return {
    callState,
    localVideoRef,
    joinCall,
    leaveCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage
  };
};
