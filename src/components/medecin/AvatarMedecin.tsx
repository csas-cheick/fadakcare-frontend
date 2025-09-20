interface AvatarMedecinProps {
  nom: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AvatarMedecin = ({ nom, photoUrl, size = 'lg' }: AvatarMedecinProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  return (
    <div className="flex-shrink-0">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={nom}
          className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white shadow-lg`}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
          {getInitials(nom)}
        </div>
      )}
    </div>
  );
};

export default AvatarMedecin;
