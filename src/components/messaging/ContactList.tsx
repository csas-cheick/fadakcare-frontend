import { useState, useEffect } from 'react';
import { MessageService, Utilisateur } from '../../services/messageService';
import ContactAvatar from './ContactAvatar';

interface ContactListProps {
  onSelectContact: (contact: Utilisateur) => void;
  selectedContact?: Utilisateur | null;
}

const ContactList = ({ onSelectContact, selectedContact }: ContactListProps) => {
  const [contacts, setContacts] = useState<Utilisateur[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // const userId = parseInt(localStorage.getItem('userId') || '0'); // unused
  const userRole = localStorage.getItem('userRole'); // 'patient' ou 'doctor'

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await MessageService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {userRole === 'doctor' ? 'Discussions' : 'Discussions'}
        </h2>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={userRole === 'doctor' ? "Rechercher un patient..." : "Rechercher un médecin..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredContacts.length > 0 ? (
          <>
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedContact?.id === contact.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <ContactAvatar
                    nom={contact.nom}
                    photoUrl={contact.photoUrl}
                    size="lg"
                    isOnline={contact.isOnline}
                    className="flex-shrink-0"
                  />

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {contact.nom}
                      </h3>
                    </div>
                    {/* Online/Offline Status */}
                    <div className="mt-1">
                      <span className={`text-xs ${
                        contact.isOnline 
                          ? 'text-green-500 dark:text-green-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {contact.isOnline 
                          ? 'En ligne' 
                          : contact.lastSeen || 'Hors ligne'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm">
              {searchTerm ? 'Aucun contact trouvé' : userRole === 'doctor' ? 'Aucun patient affecté' : 'Aucun médecin disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
