import React from 'react';
import { UserCircleIcon } from '../../icons';

interface ProfileAvatarProps {
  profilePic: string | null;
  isEditing: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profilePic,
  isEditing,
  onImageChange
}) => {
  return (
    <div className="relative flex justify-center mb-6">
      <div className="relative">
        <img
          src={profilePic || "https://picsum.photos/40"}
          alt="Photo de profil"
          className="w-32 h-32 rounded-full border-4 border-brand-500 object-cover"
        />
        {isEditing && (
          <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 border-2 border-brand-500 cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onImageChange}
            />
            <UserCircleIcon className="h-5 w-5 text-brand-600" />
          </label>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
