import React from 'react';

interface ContactAvatarProps {
  nom: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isOnline?: boolean;
}

const ContactAvatar: React.FC<ContactAvatarProps> = ({
  nom,
  photoUrl,
  size = 'md',
  className = '',
  isOnline = false
}) => {
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 text-xs';
      case 'md':
        return 'h-10 w-10 text-sm';
      case 'lg':
        return 'h-12 w-12 text-base';
      case 'xl':
        return 'h-16 w-16 text-lg';
      default:
        return 'h-10 w-10 text-sm';
    }
  };

  const getOnlineIndicatorSize = (): string => {
    switch (size) {
      case 'sm':
        return 'h-2 w-2';
      case 'md':
        return 'h-2.5 w-2.5';
      case 'lg':
        return 'h-3 w-3';
      case 'xl':
        return 'h-3.5 w-3.5';
      default:
        return 'h-2.5 w-2.5';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`Photo de profil de ${nom}`}
          className={`rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm ${getSizeClasses()}`}
          onError={(e) => {
            // Si l'image ne charge pas, remplacer par les initiales
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              target.style.display = 'none';
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = `flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold ${getSizeClasses()}`;
              fallbackDiv.textContent = getInitials(nom);
              parent.appendChild(fallbackDiv);
            }
          }}
        />
      ) : (
        <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold ${getSizeClasses()}`}>
          {getInitials(nom)}
        </div>
      )}
      
      {/* Indicateur de statut en ligne */}
      {isOnline && (
        <div className={`absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 ${getOnlineIndicatorSize()}`}></div>
      )}
    </div>
  );
};

export default ContactAvatar;