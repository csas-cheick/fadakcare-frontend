import React from 'react';
import { UserCircleIcon } from '../../icons';
import { useHeaderUser } from '../../hooks/useHeaderUser';
import { HeaderUserService } from '../../services/headerUserService';

interface UserInfoProps {
  showFullName?: boolean;
  showEmail?: boolean;
  showRole?: boolean;
  imageSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
  showFullName = false,
  showEmail = false,
  showRole = false,
  imageSize = 'md',
  className = ''
}) => {
  const { userData, loading } = useHeaderUser();

  if (loading) {
    return (
      <div className={`flex items-center animate-pulse ${className}`}>
        <div className={`rounded-full bg-gray-300 ${getSizeClasses(imageSize)}`}></div>
        <div className="ml-3">
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          {showEmail && <div className="h-3 w-32 bg-gray-300 rounded mt-1"></div>}
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const displayName = showFullName 
    ? userData.nom 
    : HeaderUserService.formatDisplayName(userData.nom);

  const formattedRole = HeaderUserService.formatRole(userData.role);

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${getSizeClasses(imageSize)}`} aria-hidden="true">
        <UserCircleIcon className={getIconSizeClasses(imageSize)} />
      </div>
      
      <div className="ml-3 min-w-0 flex-1">
        <div className="font-medium text-theme-sm text-gray-700 dark:text-gray-400 truncate">
          {displayName}
        </div>
        
        {showEmail && (
          <div className="text-theme-xs text-gray-500 dark:text-gray-400 truncate">
            {userData.email}
          </div>
        )}
        
        {showRole && (
          <div className="text-theme-xs text-gray-500 dark:text-gray-400 truncate">
            {formattedRole}
          </div>
        )}
      </div>
    </div>
  );
};

// Fonction utilitaire pour les classes de taille
function getSizeClasses(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'h-8 w-8';
    case 'md':
      return 'h-11 w-11';
    case 'lg':
      return 'h-16 w-16';
    default:
      return 'h-11 w-11';
  }
}

function getIconSizeClasses(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'h-5 w-5';
    case 'md':
      return 'h-6 w-6';
    case 'lg':
      return 'h-10 w-10';
    default:
      return 'h-6 w-6';
  }
}

export default UserInfo;
