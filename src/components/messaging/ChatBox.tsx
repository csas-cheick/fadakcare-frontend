import { useState, useEffect, useRef } from 'react';
import { MessageService, Message, Utilisateur } from '../../services/messageService';
import { useNavigate } from 'react-router';
import ContactAvatar from './ContactAvatar';

interface ChatBoxProps {
  contact: Utilisateur | null;
}

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  messageId: number | null;
  content: string;
}

const ChatBox = ({ contact }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [messageIdAModifier, setMessageIdAModifier] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [messageIdASupprimer, setMessageIdASupprimer] = useState<number | null>(null);
  const [showTeleDropdown, setShowTeleDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [optionsDropdownPosition, setOptionsDropdownPosition] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const teleDropdownRef = useRef<HTMLDivElement>(null);
  const optionsDropdownRef = useRef<HTMLDivElement>(null);
  const userId = parseInt(localStorage.getItem('userId') || '0');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    if (contact) {
      fetchMessages();
    }
  }, [contact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Fermer le context menu
      setContextMenu(null);
      
      // Fermer le dropdown télémedecine si clic extérieur
      if (teleDropdownRef.current && !teleDropdownRef.current.contains(target)) {
        setShowTeleDropdown(false);
      }
      
      // Fermer le dropdown options si clic extérieur
      if (showOptionsDropdown && optionsDropdownRef.current && !optionsDropdownRef.current.contains(target)) {
        // Vérifier que le clic n'est pas sur le bouton des trois points
        const optionsButton = document.querySelector('[data-options-button]');
        if (!optionsButton || !optionsButton.contains(target)) {
          setShowOptionsDropdown(false);
        }
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setShowTeleDropdown(false);
        setShowOptionsDropdown(false);
        if (editMode) {
          setEditMode(false);
          setMessageIdAModifier(null);
          setNewMessage('');
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editMode, showOptionsDropdown]);

  const fetchMessages = async () => {
    if (!contact) return;
    setLoading(true);
    try {
      const data = await MessageService.getMessages(contact.id);
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !contact) return;

    try {
      const success = await MessageService.sendMessage(contact.id, newMessage.trim());
      if (success) {
        setNewMessage('');
        fetchMessages(); // Recharger les messages après envoi
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const editMessage = async () => {
    if (!newMessage.trim() || messageIdAModifier === null) return;

    try {
      const success = await MessageService.editMessage(messageIdAModifier, newMessage.trim());
      if (success) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageIdAModifier ? { ...msg, contenu: newMessage.trim() } : msg
          )
        );
        setNewMessage('');
        setEditMode(false);
        setMessageIdAModifier(null);
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleSend = () => {
    if (editMode) {
      editMessage();
    } else {
      sendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditMessage = () => {
    if (contextMenu && contextMenu.messageId !== null) {
      setMessageIdAModifier(contextMenu.messageId);
      setNewMessage(contextMenu.content);
      setEditMode(true);
    }
    setContextMenu(null);
  };

  const handleDeleteMessage = async () => {
    if (!messageIdASupprimer) return;
    
    try {
      const success = await MessageService.deleteMessage(messageIdASupprimer);
      if (success) {
        fetchMessages(); // Recharger les messages après suppression
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setContextMenu(null);
      setConfirmDelete(false);
      setMessageIdASupprimer(null);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleRedirectTelemedicine = () => {
    setShowTeleDropdown(false);
    if (role === 'admin') {
      navigate('/admin/telemedecine');
    } else if (role === 'medecin'|| role === 'doctor ') {
      navigate('/medecin/telemedecine');
    } else {
      navigate('/patient/telemedecine');
    }
  };

  const handleTeleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      x: rect.left,
      y: rect.bottom + 5
    });
    setShowTeleDropdown(!showTeleDropdown);
  };

  const handleOptionsButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOptionsDropdownPosition({
      x: rect.left,
      y: rect.bottom + 5
    });
    setShowOptionsDropdown(!showOptionsDropdown);
  };

  const handleRefreshMessages = async () => {
    setShowOptionsDropdown(false);
    await fetchMessages();
  };

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-24 w-24 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
          <p>Choisissez un contact dans la liste pour commencer à discuter</p>
        </div>
      </div>
    );
  }
  console.log("Est qu'il est en ligne : ",contact.isOnline);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="flex items-center space-x-3">
          <ContactAvatar
            nom={contact.nom}
            photoUrl={contact.photoUrl}
            size="md"
            isOnline={contact.isOnline}
            className="flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{contact.nom}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {contact.isOnline ? 'En ligne' : contact.lastSeen || 'Hors ligne'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button  
              onClick={handleTeleButtonClick} 
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button 
              onClick={handleTeleButtonClick} 
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              onClick={handleOptionsButtonClick}
              data-options-button
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900" style={{backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23f3f4f6' fill-opacity='0.3'%3e%3ccircle cx='30' cy='30' r='2'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`}}>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.expediteurId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm relative group ${
                    message.expediteurId === userId
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (message.expediteurId !== userId) return;
                    setContextMenu({
                      visible: true,
                      x: e.pageX,
                      y: e.pageY,
                      messageId: message.id,
                      content: message.contenu,
                    });
                  }}
                  onTouchStart={(e) => {
                    if (message.expediteurId !== userId) return;
                    const touch = e.touches[0];
                    const timeout = setTimeout(() => {
                      setContextMenu({
                        visible: true,
                        x: touch.pageX,
                        y: touch.pageY,
                        messageId: message.id,
                        content: message.contenu,
                      });
                    }, 600);
                    const target = e.target as HTMLElement;
                    const clearTouch = () => clearTimeout(timeout);
                    target.addEventListener('touchend', clearTouch, { once: true });
                    target.addEventListener('touchmove', clearTouch, { once: true });
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.contenu}</p>
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    message.expediteurId === userId ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-xs">{formatTime(message.dateEnvoi)}</span>
                    {message.expediteurId === userId && (
                      <div className="flex">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-4 h-4 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu?.visible && contextMenu.messageId !== null && (
        <div 
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditMessage}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Modifier
          </button>
          <button
            onClick={() => {
              setMessageIdASupprimer(contextMenu.messageId);
              setConfirmDelete(true);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Supprimer
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteMessage}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
        {editMode && (
          <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Mode modification - Appuyez sur Échap pour annuler
            </p>
          </div>
        )}
        <div className="flex items-end space-x-3">
          <button className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={editMode ? "Modifier le message..." : "Tapez votre message..."}
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          <button className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`flex-shrink-0 p-2 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
      {/* Telemedecine Dropdown */}
      {showTeleDropdown && (
        <div 
          ref={teleDropdownRef}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-3 px-4 z-50 min-w-[280px]"
          style={{ 
            top: dropdownPosition.y, 
            left: Math.max(10, Math.min(dropdownPosition.x, window.innerWidth - 300))
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Appel de télémedecine
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Vous ne pouvez passer que des appels de télémedecine. Voulez-vous continuer ?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowTeleDropdown(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleRedirectTelemedicine}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Options Dropdown */}
      {showOptionsDropdown && (
        <div 
          ref={optionsDropdownRef}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
          style={{ 
            top: optionsDropdownPosition.y, 
            left: Math.max(10, Math.min(optionsDropdownPosition.x, window.innerWidth - 180))
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRefreshMessages}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      )}

      {/* Message Input */}
    </div>
  );
};

export default ChatBox;
