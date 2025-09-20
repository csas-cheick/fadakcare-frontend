import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import ContactList from '../../components/messaging/ContactList';
import ChatBox from '../../components/messaging/ChatBox';
import { Utilisateur } from '../../services/messageService';

const Messagerie = () => {
  const location = useLocation();
  const [selectedContact, setSelectedContact] = useState<Utilisateur | null>(null);

  useEffect(() => {
    // Vérifier si un contact a été passé lors de la navigation
    if (location.state?.selectedContact) {
      const contact = location.state.selectedContact;
      setSelectedContact({
        id: parseInt(contact.id) || 0,
        nom: contact.nom,
        avatar: contact.avatar,
        lastSeen: new Date().toISOString(),
        isOnline: false
      });
    }
  }, [location.state]);

  const handleSelectContact = (contact: Utilisateur) => {
    setSelectedContact(contact);
  };

  return (
    <>
      <PageMeta title="Messagerie" description="Communiquez avec vos médecins et l'équipe médicale" />
      
      <div className="h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-900">
        <div className="flex h-full max-w-7xl mx-auto">
          {/* Liste des contacts */}
          <div className="w-1/3 min-w-[320px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
            </div>
            <ContactList 
              onSelectContact={handleSelectContact}
              selectedContact={selectedContact}
            />
          </div>

          {/* Zone de chat */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <ChatBox contact={selectedContact} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choisissez un contact dans la liste pour commencer à discuter.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messagerie;
