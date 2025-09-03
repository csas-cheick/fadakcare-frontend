import { useState, useEffect } from 'react';
import { NewMedecin } from '../../types';
import { useModal } from '../../context/ModalContext';

interface AddMedecinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (medecinData: NewMedecin) => Promise<void>;
}

function AddMedecinModal({
  isOpen,
  onClose,
  onConfirm
}: AddMedecinModalProps) {
  const { setModalOpen } = useModal();
  const [formData, setFormData] = useState<NewMedecin>({
    nom: "",
    dateNaissance: "",
    telephone: "",
    email: "",
    motDePasse: "",
    adresse: "",
    specialite: "",
    numeroOrdre: "",
    service: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gérer l'état du modal pour cacher le header
  useEffect(() => {
    setModalOpen(isOpen);
    return () => setModalOpen(false);
  }, [isOpen, setModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onConfirm(formData);
      // Reset form
      setFormData({
        nom: "",
        dateNaissance: "",
        telephone: "",
        email: "",
        motDePasse: "",
        adresse: "",
        specialite: "",
        numeroOrdre: "",
        service: "",
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const specialites = [
    "Cardiologie",
    "Dermatologie",
    "Neurologie",
    "Pédiatrie",
    "Psychiatrie",
    "Radiologie",
    "Chirurgie générale",
    "Médecine interne",
    "Oncologie",
    "Gynécologie",
    "Urologie",
    "Ophtalmologie",
    "ORL",
    "Anesthésie-Réanimation",
    "Médecine d'urgence"
  ];

  const services = [
    "Urgences",
    "Consultation externe",
    "Hospitalisation",
    "Soins intensifs",
    "Bloc opératoire",
    "Radiologie",
    "Laboratoire",
    "Pharmacie"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Overlay avec animation */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal avec design amélioré */}
        <div
          className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-medecin-modal-title"
        >
          <form onSubmit={handleSubmit}>
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 id="add-medecin-modal-title" className="text-2xl font-bold text-white">
                    Ajouter un nouveau médecin
                  </h3>
                  <p className="text-blue-100 mt-1">
                    Remplissez les informations du médecin à ajouter
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer la fenêtre d'ajout de médecin"
                  title="Fermer"
                  className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Corps du modal */}
            <div className="bg-white dark:bg-gray-800 px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{/* Nom */}
                <div className="group">
                  <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                    placeholder="Dr. Jean Dupont"
                  />
                </div>

                {/* Email */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                    placeholder="jean.dupont@hospital.com"
                  />
                </div>

                {/* Mot de passe */}
                <div className="group">
                  <label htmlFor="motDePasse" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="motDePasse"
                    name="motDePasse"
                    required
                    value={formData.motDePasse}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                    placeholder="Mot de passe sécurisé"
                  />
                </div>

                {/* Téléphone */}
                <div className="group">
                  <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    required
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                {/* Date de naissance */}
                <div className="group">
                  <label htmlFor="dateNaissance" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    id="dateNaissance"
                    name="dateNaissance"
                    required
                    value={formData.dateNaissance}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                  />
                </div>

                {/* Numéro d'ordre */}
                <div className="group">
                  <label htmlFor="numeroOrdre" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Numéro d'ordre *
                  </label>
                  <input
                    type="text"
                    id="numeroOrdre"
                    name="numeroOrdre"
                    required
                    value={formData.numeroOrdre}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                    placeholder="123456789"
                  />
                </div>

                {/* Spécialité */}
                <div className="group">
                  <label htmlFor="specialite" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Spécialité *
                  </label>
                  <select
                    id="specialite"
                    name="specialite"
                    required
                    value={formData.specialite}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                  >
                    <option value="">Sélectionner une spécialité</option>
                    {specialites.map(specialite => (
                      <option key={specialite} value={specialite}>
                        {specialite}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div className="group">
                  <label htmlFor="service" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Service *
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                  >
                    <option value="">Sélectionner un service</option>
                    {services.map(service => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Adresse */}
                <div className="sm:col-span-2 group">
                  <label htmlFor="adresse" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    required
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800/50"
                    placeholder="123 Rue de la Santé, 75013 Paris"
                  />
                </div>
              </div>
            </div>

            {/* Footer du modal */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ajout en cours...
                  </>
                ) : (
                  'Ajouter le médecin'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedecinModal;
