import React, { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface PhotoUploadProps {
  onPhotoChange: (photoUrl: string | null) => void;
  currentPhotoUrl?: string | null;
  className?: string;
  userId?: string;
  userType?: 'patient' | 'medecin' | 'admin';
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onPhotoChange, 
  currentPhotoUrl, 
  className = '', 
  userId,
  userType = 'medecin'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non supporté. Utilisez JPG, PNG ou WebP');
      return;
    }

    // Validation de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximum : 5MB');
      return;
    }

    // Créer un aperçu local
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Si on a un userId, uploader directement vers Cloudinary
    if (userId) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('userType', userType);

        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5120/api/upload/profile-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          onPhotoChange(result.photoUrl);
        } else {
          alert(result.message || 'Erreur lors de l\'upload');
          setPreview(currentPhotoUrl || null);
        }
      } catch (error) {
        console.error('Erreur upload:', error);
        alert('Erreur lors de l\'upload de la photo');
        setPreview(currentPhotoUrl || null);
      } finally {
        setUploading(false);
      }
    } else {
      // Mode preview uniquement (pour la création avant d'avoir un ID)
      onPhotoChange(previewUrl);
    }
  }, [userId, userType, onPhotoChange, currentPhotoUrl]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        aria-label="Sélectionner une photo de profil"
      />
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Aperçu photo de profil" 
              className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white dark:border-gray-700 shadow-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Cliquez pour changer la photo
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              ) : (
                <PhotoIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {uploading ? 'Upload en cours...' : 'Ajouter une photo de profil'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Glissez-déposez une image ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                PNG, JPG, WEBP jusqu'à 5MB
              </p>
            </div>
            <CloudArrowUpIcon className="w-8 h-8 text-blue-500 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;