import { useState } from 'react';
import PageMeta from '../components/common/PageMeta';
import ContactList from '../components/messaging/ContactList';
import ChatBox from '../components/messaging/ChatBox';
import { Utilisateur } from '../services/messageService';

const Messaging = () => {
  const [selectedContact, setSelectedContact] = useState<Utilisateur | null>(null);

  return (
    <>
      <PageMeta title="Messagerie" description="Messagerie instantanée pour communiquer en temps réel" />
      
      <div className="h-screen flex flex-col">
        {/* Header Title */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Messagerie
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Communiquez avec vos contacts en temps réel
          </p>
        </div>

        {/* Messaging Interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Contact List - Left Side */}
          <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <ContactList 
              onSelectContact={setSelectedContact}
              selectedContact={selectedContact}
            />
          </div>

          {/* Chat Area - Right Side */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ChatBox contact={selectedContact} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Messaging;
