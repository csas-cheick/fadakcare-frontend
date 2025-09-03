import React from 'react';
import Badge from '../ui/badge/Badge';
import { ProfileService } from '../../services/profileService';

interface RoleBadgeProps {
  role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'doctor':
        return 'success';
      case 'patient':
        return 'primary';
      default:
        return 'light';
    }
  };

  return (
    <Badge 
      color={getRoleColor(role)} 
      variant="solid"
      size="md"
    >
      {ProfileService.formatRole(role)}
    </Badge>
  );
};

export default RoleBadge;
