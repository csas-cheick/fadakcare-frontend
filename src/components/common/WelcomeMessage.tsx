import React from 'react';
import { useHeaderUser } from '../../hooks/useHeaderUser';
import { HeaderUserService } from '../../services/headerUserService';

interface WelcomeMessageProps {
  className?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ 
  className = '' 
}) => {
  const { userData, loading } = useHeaderUser();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 w-40 bg-gray-300 rounded"></div>
        <div className="h-4 w-32 bg-gray-300 rounded mt-1"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={className}>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Bienvenue !
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bon retour sur FadakCare
        </p>
      </div>
    );
  }

  const displayName = HeaderUserService.formatDisplayName(userData.nom);
  const formattedRole = HeaderUserService.formatRole(userData.role);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return `Bonjour ${displayName} !`;
    } else if (hour < 18) {
      return `Bon après-midi ${displayName} !`;
    } else {
      return `Bonsoir ${displayName} !`;
    }
  };

  const getRoleSpecificMessage = () => {
    switch (userData.role?.toLowerCase()) {
      case 'patient':
        return 'Gérez vos rendez-vous et consultez votre calendrier médical';
      case 'doctor':
        return 'Consultez vos patients et gérez votre planning';
      case 'admin':
        return 'Administrez la plateforme et supervisez les activités';
      default:
        return 'Bienvenue sur la plateforme FadakCare';
    }
  };

  return (
    <div className={className}>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        {getWelcomeMessage()}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {getRoleSpecificMessage()} • {formattedRole}
      </p>
    </div>
  );
};

export default WelcomeMessage;
