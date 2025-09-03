import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';

interface RendezVousFormData {
  date: string;
  heure: string;
  motif: string;
  type: 'consultation' | 'suivi' | 'urgence';
  commentaires: string;
}

interface MedecinInfo {
  id: string;
  nom: string;
  specialite: string;
  service: string;
}

const RendezVous = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [medecin, setMedecin] = useState<MedecinInfo | null>(null);
  const [formData, setFormData] = useState<RendezVousFormData>({
    date: '',
    heure: '',
    motif: '',
    type: 'consultation',
    commentaires: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.medecin) {
      setMedecin(location.state.medecin);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Ici, vous feriez un vrai appel API pour enregistrer le rendez-vous
      console.log('Rendez-vous demandé:', {
        medecin: medecin?.nom,
        ...formData
      });

      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/patient/rendez-vous-liste');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la prise de rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const creneauxHoraires = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  if (success) {
    return (
      <>
        <PageMeta title="Rendez-vous confirmé" description="Votre demande de rendez-vous a été envoyée" />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
              Demande envoyée avec succès !
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Votre demande de rendez-vous avec {medecin?.nom} a été transmise. 
              Vous recevrez une confirmation par email sous 24h.
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Redirection automatique vers vos rendez-vous...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Prendre Rendez-vous" description="Demander un rendez-vous médical" />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Prendre Rendez-vous
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Demandez un rendez-vous avec votre médecin
          </p>
        </div>

        {/* Médecin Info */}
        {medecin && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Rendez-vous avec
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {medecin.nom.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">{medecin.nom}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{medecin.specialite}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date et Heure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date souhaitée *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="heure" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heure souhaitée *
                </label>
                <select
                  id="heure"
                  name="heure"
                  value={formData.heure}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sélectionner une heure</option>
                  {creneauxHoraires.map(heure => (
                    <option key={heure} value={heure}>{heure}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type et Motif */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de consultation *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="consultation">Consultation générale</option>
                  <option value="suivi">Suivi médical</option>
                  <option value="urgence">Consultation urgente</option>
                </select>
              </div>

              <div>
                <label htmlFor="motif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motif de consultation *
                </label>
                <input
                  type="text"
                  id="motif"
                  name="motif"
                  value={formData.motif}
                  onChange={handleInputChange}
                  placeholder="Ex: Douleurs abdominales, contrôle..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Commentaires */}
            <div>
              <label htmlFor="commentaires" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commentaires additionnels
              </label>
              <textarea
                id="commentaires"
                name="commentaires"
                value={formData.commentaires}
                onChange={handleInputChange}
                rows={4}
                placeholder="Informations complémentaires, symptômes, questions..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Demander le rendez-vous
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RendezVous;
