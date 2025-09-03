import React, { useState, useEffect, useCallback } from 'react';
import { CreateSessionRequest } from '../../types/telemedecine';
import { telemedicineAPI } from '../../services/telemedicineService';
import { useModal } from '../../context/ModalContext';

interface CreateSessionModalProps {
  onClose: () => void;
  onSubmit: (data: CreateSessionRequest) => void;
}

interface User {
  id: number;
  nom: string;
  role: string;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  onClose,
  onSubmit
}) => {
  const { setModalOpen } = useModal();
  
  const [formData, setFormData] = useState<CreateSessionRequest>({
    titre: '',
    description: '',
    dateDebut: '',
    duree: 30,
    type: 'medecin_patient',
    participantsIds: []
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const participants = await telemedicineAPI.getAvailableParticipants(formData.type);
      setUsers(participants.map(p => ({
        id: p.id,
        nom: p.nom,
        role: p.role
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      setError('Erreur lors du chargement des participants');
    } finally {
      setLoading(false);
    }
  }, [formData.type]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Ouvrir le modal au montage du composant
  useEffect(() => {
    setModalOpen(true);
    
    // Nettoyer en fermant le modal au démontage
    return () => {
      setModalOpen(false);
    };
  }, [setModalOpen]);

  // Fonction wrapper pour fermer le modal
  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.titre.trim()) {
        throw new Error('Le titre est requis');
      }
      if (!formData.dateDebut) {
        throw new Error('La date et l\'heure sont requises');
      }
      if (formData.duree < 5 || formData.duree > 240) {
        throw new Error('La durée doit être entre 5 et 240 minutes');
      }

      // Vérifier que la date n'est pas dans le passé
      const now = new Date();
      const sessionDate = new Date(formData.dateDebut);
      if (sessionDate <= now) {
        throw new Error('La date doit être dans le futur');
      }

      await onSubmit(formData);
      // Fermer le modal après soumission réussie
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duree' ? parseInt(value) : value
    }));
  };

  const handleParticipantToggle = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      participantsIds: prev.participantsIds?.includes(userId)
        ? prev.participantsIds.filter(id => id !== userId)
        : [...(prev.participantsIds || []), userId]
    }));
  };

  const getFilteredUsers = () => {
    // Le filtrage est maintenant fait côté backend selon le type de session
    return users;
  };

  const getMinDateTime = () => {
  // Utiliser l'heure locale (pas toISOString qui convertit en UTC) pour datetime-local
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5); // Au moins 5 minutes dans le futur
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle session de télémedecine</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              title="Fermer"
              aria-label="Fermer la modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre de la session *
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Consultation de suivi, Réunion d'équipe..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description optionnelle de la session..."
              />
            </div>

            {/* Type de session */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de session *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="medecin_patient">Consultation individuelle (1 patient)</option>
                <option value="medecin_patients">Consultation de groupe (plusieurs patients)</option>
                <option value="medecin_medecin">Réunion médicale (entre médecins)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date et heure */}
              <div>
                <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date et heure *
                </label>
                <input
                  type="datetime-local"
                  id="dateDebut"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleInputChange}
                  min={getMinDateTime()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Durée */}
              <div>
                <label htmlFor="duree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durée (minutes) *
                </label>
                <input
                  type="number"
                  id="duree"
                  name="duree"
                  value={formData.duree}
                  onChange={handleInputChange}
                  min={5}
                  max={240}
                  step={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Participants
                {formData.type === 'medecin_patient' && ' (sélectionnez 1 patient)'}
                {formData.type === 'medecin_patients' && ' (sélectionnez les patients)'}
                {formData.type === 'medecin_medecin' && ' (sélectionnez les médecins)'}
              </label>
              
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg">
                {getFilteredUsers().length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Aucun utilisateur disponible
                  </div>
                ) : (
                  getFilteredUsers().map(user => (
                    <label
                      key={user.id}
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={formData.participantsIds?.includes(user.id) || false}
                        onChange={() => handleParticipantToggle(user.id)}
                        disabled={
                          formData.type === 'medecin_patient' && 
                          formData.participantsIds?.length === 1 && 
                          !formData.participantsIds.includes(user.id)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.nom}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Boutons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={handleClose}
        className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Création...' : 'Créer la session'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionModal;
