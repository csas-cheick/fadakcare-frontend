import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import ChangePasswordModal from "../components/UserProfile/ChangePasswordModal";
import ProfileAvatar from "../components/UserProfile/ProfileAvatar";
import { ProfileService, UserProfile } from "../services/profileService";
import { 
  PencilIcon, 
  LockIcon, 
  UserCircleIcon, 
  EnvelopeIcon, 
  CalenderIcon,
  MailIcon,
  UserIcon,
  CheckLineIcon,
  CloseIcon
} from "../icons";

export default function UserProfiles() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    nom: "",
    dateNaissance: "",
    adresse: "",
    telephone: "",
    role: "",
    email: "",
    photoUrl: null,
    profession: "",
    specialite: "",
    service: "",
    numeroOrdre: "",
    grade: ""
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { userId, role } = ProfileService.getCurrentUser();
      
      if (!role || !userId) {
        console.error("Utilisateur non identifié");
        return;
      }

      setLoading(true);
      try {
        const data = await ProfileService.getUserProfile(role, userId);
        console.log("Profile data received:", data);
        console.log("Role value:", data.role);
        setProfile(data);
      } catch (error) {
        console.error("Impossible de charger le profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'medecin': 
      case 'doctor': return 'Médecin';
      case 'patient': return 'Patient';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medecin': 
      case 'doctor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'patient': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handlePhotoChange = (photoUrl: string | null) => {
    setProfile({ ...profile, photoUrl: photoUrl });
  };

  const handleSaveChanges = async () => {
    const validationError = ProfileService.validateProfileData(profile);
    if (validationError) {
      console.error(validationError);
      return;
    }

    const { userId, role } = ProfileService.getCurrentUser();
    if (!userId || !role) {
      console.error("Utilisateur non identifié");
      return;
    }

    setSaveLoading(true);
    try {
      await ProfileService.updateUserProfile(role, userId, profile);
      console.log("Informations mises à jour avec succès !");
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    const validationError = ProfileService.validatePasswordChange(oldPassword, newPassword, confirmPassword);
    if (validationError) {
      throw new Error(validationError);
    }

    const { userId, role } = ProfileService.getCurrentUser();
    if (!userId || !role) {
      throw new Error("Utilisateur non identifié");
    }

    await ProfileService.changePassword(role, userId, { oldPassword, newPassword });
    console.log("Mot de passe mis à jour avec succès !");
  };

  const handleNavigateToCalendar = () => {
    if (profile.role === 'medecin' || profile.role === 'doctor') {
      navigate('/medecin/calendrier');
    } else if (profile.role === 'patient') {
      navigate('/patient/calendrier');
    }
  };

  const handleNavigateToAppointments = () => {
    if (profile.role === 'medecin' || profile.role === 'doctor') {
      navigate('/medecin/rendez-vous');
    } else if (profile.role === 'patient') {
      navigate('/patient/rendez-vous');
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta
          title="Mon Profil | FadakCare - Plateforme Médicale"
          description="Consultez vos informations personnelles et professionnelles"
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement du profil...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Mon Profil | FadakCare - Plateforme Médicale"
        description="Consultez vos informations personnelles et professionnelles"
      />
      
      {/* Header avec gradient */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <ProfileAvatar
                profilePic={profile.photoUrl}
                isEditing={isEditing}
                onPhotoChange={handlePhotoChange}
                userId={ProfileService.getCurrentUser().userId ?? undefined }
                userType={profile.role === 'patient' ? 'patient' : profile.role === 'admin' ? 'admin' : 'medecin'}
              />
              {!isEditing && (
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-green-500 border-3 border-white flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {profile.nom || 'Nom non défini'}
              </h1>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)} bg-white/20 text-white border border-white/30`}>
                  {getRoleDisplayName(profile.role)}
                </span>
                {profile.profession && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 border border-white/20">
                    {profile.profession}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={saveLoading}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm"
                  startIcon={<CheckLineIcon className="h-4 w-4" />}
                >
                  {saveLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm"
                  startIcon={<CloseIcon className="h-4 w-4" />}
                >
                  Annuler
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm"
                  startIcon={<PencilIcon className="h-4 w-4" />}
                >
                  Modifier
                </Button>
                <Button 
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm"
                  startIcon={<LockIcon className="h-4 w-4" />}
                >
                  Sécurité
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Informations Personnelles
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.nom || ''}
                      onChange={(e) => handleProfileChange('nom', e.target.value)}
                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Entrez votre nom"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile.nom || 'Non défini'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <EnvelopeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-green-500 focus:outline-none"
                      placeholder="Entrez votre email"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile.email || 'Non défini'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <MailIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.telephone || ''}
                      onChange={(e) => handleProfileChange('telephone', e.target.value)}
                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="Entrez votre téléphone"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile.telephone || 'Non défini'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <CalenderIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date de naissance</p>
                  {isEditing ? (
                    <input
                      type="date"
                      aria-label="Date de naissance"
                      title="Date de naissance"
                      placeholder="YYYY-MM-DD"
                      value={profile.dateNaissance || ''}
                      onChange={(e) => handleProfileChange('dateNaissance', e.target.value)}
                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile.dateNaissance ? new Date(profile.dateNaissance).toLocaleDateString('fr-FR') : 'Non définie'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
              Informations Professionnelles
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                    {profile.role?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getRoleDisplayName(profile.role)}
                  </p>
                </div>
              </div>
            </div>

            {/* Champs spécifiques aux médecins */}
            {(profile.role === 'medecin' || profile.role === 'doctor') && (
              <>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <UserCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Spécialité</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.specialite || ''}
                          onChange={(e) => handleProfileChange('specialite', e.target.value)}
                          className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                          placeholder="Entrez votre spécialité"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">
                          {profile.specialite || 'Non définie'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                      <MailIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.service || ''}
                          onChange={(e) => handleProfileChange('service', e.target.value)}
                          className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:outline-none"
                          placeholder="Entrez votre service"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">
                          {profile.service || 'Non défini'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Numéro d'ordre</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.numeroOrdre || ''}
                          onChange={(e) => handleProfileChange('numeroOrdre', e.target.value)}
                          className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:outline-none"
                          placeholder="Entrez votre numéro d'ordre"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">
                          {profile.numeroOrdre || 'Non défini'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Champs spécifiques aux patients */}
            {profile.role === 'patient' && profile.profession && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profession</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.profession || ''}
                        onChange={(e) => handleProfileChange('profession', e.target.value)}
                        className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:outline-none"
                        placeholder="Entrez votre profession"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile.profession}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Champs spécifiques aux admins */}
            {profile.role === 'admin' && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.grade || ''}
                        onChange={(e) => handleProfileChange('grade', e.target.value)}
                        className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-red-500 focus:outline-none"
                        placeholder="Entrez votre grade"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile.grade || 'Non défini'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                  <MailIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.adresse || ''}
                      onChange={(e) => handleProfileChange('adresse', e.target.value)}
                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="Entrez votre adresse"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {profile.adresse || 'Non définie'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques et navigation rapides */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Statut du compte</p>
              <p className="text-2xl font-bold">Actif</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Navigation vers calendrier selon le rôle */}
        {(profile.role === 'medecin' || profile.role === 'doctor' || profile.role === 'patient') && (
          <div 
            onClick={handleNavigateToCalendar}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Mon Calendrier</p>
                <p className="text-2xl font-bold">Voir</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <CalenderIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation vers rendez-vous selon le rôle */}
        {(profile.role === 'medecin' || profile.role === 'doctor' || profile.role === 'patient') && (
          <div 
            onClick={handleNavigateToAppointments}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Mes Rendez-vous</p>
                <p className="text-2xl font-bold">Gérer</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}

        {/* Card pour les admins */}
        {profile.role === 'admin' && (
          <>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Dernière connexion</p>
                  <p className="text-2xl font-bold">Aujourd'hui</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CalenderIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Notifications</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <EnvelopeIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal changement de mot de passe */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </>
  );
}
