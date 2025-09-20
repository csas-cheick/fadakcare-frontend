import React from 'react';
import { UserCircleIcon } from '../../icons';
import PhotoUpload from '../common/PhotoUpload';

interface ProfileAvatarProps {
  profilePic: string | null;
  isEditing: boolean;
  onPhotoChange: (photoUrl: string | null) => void;
  userId?: string;
  userType?: 'patient' | 'medecin' | 'admin';
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profilePic,
  isEditing,
  onPhotoChange,
  userId,
  userType = 'medecin'
}) => {
  if (isEditing && userId) {
    return (
      <div className="flex justify-center mb-6">
        <PhotoUpload
          onPhotoChange={onPhotoChange}
          currentPhotoUrl={profilePic}
          userId={userId}
          userType={userType}
          className="max-w-sm"
        />
      </div>
    );
  }

  return (
    <div className="relative flex justify-center mb-6">
      <div className="relative">
        <img
          src={profilePic || "https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=128"}
          alt="Photo de profil"
          className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover shadow-lg"
        />
        {!isEditing && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <UserCircleIcon className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
