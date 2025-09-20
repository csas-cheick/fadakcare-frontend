import React from 'react';
import { UserProfile } from '../../services/profileService';

interface RoleSpecificFieldsProps {
  profile: UserProfile;
  isEditing: boolean;
  onProfileChange: (field: keyof UserProfile, value: string) => void;
}

const RoleSpecificFields: React.FC<RoleSpecificFieldsProps> = ({
  profile,
  isEditing,
  onProfileChange
}) => {
  const inputClassName = (disabled: boolean) => `
    w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 
    shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden 
    focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 
    dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800
    ${disabled ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed' : ''}
  `;

  const renderAdminFields = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
        Grade
      </label>
      <input
        type="text"
        value={profile.grade || ''}
        onChange={(e) => onProfileChange('grade', e.target.value)}
        disabled={!isEditing}
        className={inputClassName(!isEditing)}
        placeholder="Entrez votre grade"
      />
    </div>
  );

  const renderDoctorFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
          Spécialité
        </label>
        <input
          type="text"
          value={profile.specialite || ''}
          onChange={(e) => onProfileChange('specialite', e.target.value)}
          disabled={!isEditing}
          className={inputClassName(!isEditing)}
          placeholder="Entrez votre spécialité médicale"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
          Service
        </label>
        <input
          type="text"
          value={profile.service || ''}
          onChange={(e) => onProfileChange('service', e.target.value)}
          disabled={!isEditing}
          className={inputClassName(!isEditing)}
          placeholder="Entrez votre service"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
          Numéro d'ordre
        </label>
        <input
          type="text"
          value={profile.numeroOrdre || ''}
          onChange={(e) => onProfileChange('numeroOrdre', e.target.value)}
          disabled={!isEditing}
          className={inputClassName(!isEditing)}
          placeholder="Entrez votre numéro d'ordre"
        />
      </div>
    </div>
  );

  const renderPatientFields = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
        Profession
      </label>
      <input
        type="text"
        value={profile.profession || ''}
        onChange={(e) => onProfileChange('profession', e.target.value)}
        disabled={!isEditing}
        className={inputClassName(!isEditing)}
        placeholder="Entrez votre profession"
      />
    </div>
  );

  const getRoleFields = () => {
    switch (profile.role?.toLowerCase()) {
      case 'admin':
        return renderAdminFields();
      case 'doctor':
        return renderDoctorFields();
      case 'patient':
        return renderPatientFields();
      default:
        return null;
    }
  };

  const roleFields = getRoleFields();

  if (!roleFields) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 text-center">
        Informations professionnelles
      </h3>
      {roleFields}
    </div>
  );
};

export default RoleSpecificFields;
