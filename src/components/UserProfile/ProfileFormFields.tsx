import React from 'react';
import { UserProfile } from '../../services/profileService';

interface ProfileFormFieldsProps {
  profile: UserProfile;
  isEditing: boolean;
  onProfileChange: (field: keyof UserProfile, value: string) => void;
}

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
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

  const textareaClassName = (disabled: boolean) => `
    w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 
    shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden 
    focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 
    dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800
    ${disabled ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed' : ''}
  `;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 text-center">
        Informations personnelles
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
          Nom complet
        </label>
        <input
          type="text"
          value={profile.nom}
          onChange={(e) => onProfileChange('nom', e.target.value)}
          disabled={!isEditing}
          className={inputClassName(!isEditing)}
          placeholder="Entrez votre nom complet"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
            Date de naissance
          </label>
          <input
            type="date"
            value={profile.dateNaissance}
            onChange={(e) => onProfileChange('dateNaissance', e.target.value)}
            disabled={!isEditing}
            className={inputClassName(!isEditing)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
            Téléphone
          </label>
          <input
            type="tel"
            value={profile.telephone}
            onChange={(e) => onProfileChange('telephone', e.target.value)}
            disabled={!isEditing}
            className={inputClassName(!isEditing)}
            placeholder="Entrez votre numéro de téléphone"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
          Adresse
        </label>
        <textarea
          value={profile.adresse}
          onChange={(e) => onProfileChange('adresse', e.target.value)}
          disabled={!isEditing}
          rows={3}
          className={textareaClassName(!isEditing)}
          placeholder="Entrez votre adresse complète"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={profile.email}
          onChange={(e) => onProfileChange('email', e.target.value)}
          disabled={!isEditing}
          className={inputClassName(!isEditing)}
          placeholder="Entrez votre adresse email"
        />
      </div>
    </div>
  );
};

export default ProfileFormFields;
