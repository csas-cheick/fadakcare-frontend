import { useNavigate } from 'react-router-dom';
import { MedecinDto } from '../../services/medecinService';
import BadgeSpecialite from './BadgeSpecialite';
import ContactInfo from './ContactInfo';
import ContactAvatar from '../messaging/ContactAvatar';

interface MedecinCardProps {
  medecin: MedecinDto;
  showActions?: boolean;
  onSendMessage?: () => void;
  onMakeAppointment?: () => void;
}

const MedecinCard = ({ 
  medecin, 
  showActions = true, 
  onSendMessage, 
  onMakeAppointment 
}: MedecinCardProps) => {
  const navigate = useNavigate();

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage();
    } else {
      // Naviguer vers la messagerie avec le médecin sélectionné
      navigate('/patient/messagerie', { 
        state: { 
          selectedContact: {
            id: medecin.nom, // Utilisation du nom comme ID temporaire
            nom: medecin.nom,
            type: 'medecin',
            avatar: medecin.photoUrl
          }
        }
      });
    }
  };

  const handleMakeAppointment = () => {
    if (onMakeAppointment) {
      onMakeAppointment();
    } else {
      // Naviguer vers la prise de rendez-vous
      navigate('/patient/prendre-rendez-vous', {
        state: {
          medecin: {
            id: medecin.nom,
            nom: medecin.nom,
            specialite: medecin.specialite,
            service: medecin.service
          }
        }
      });
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-8">
        {/* Doctor Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-6 mb-8">
          <ContactAvatar nom={medecin.nom} photoUrl={medecin.photoUrl} size="xl" />

          {/* Doctor Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {medecin.nom}
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <BadgeSpecialite specialite={medecin.specialite} variant="primary" />
              <BadgeSpecialite specialite={medecin.service} variant="secondary" />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations de contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactInfo 
              type="phone" 
              value={medecin.telephone} 
              label="Téléphone" 
            />
            <ContactInfo 
              type="email" 
              value={medecin.email} 
              label="Email" 
            />
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleSendMessage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Envoyer un message
              </button>
              
              <button 
                onClick={handleMakeAppointment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M5 13h14l-1 8H6l-1-8z" />
                </svg>
                Prendre rendez-vous
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedecinCard;
