import React, { useEffect, useState, useCallback } from 'react';
import { HttpService } from '../../services/httpService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import { AlertIcon, PaperPlaneIcon, ArrowRightIcon, ErrorIcon } from '../../icons';
import ContactAvatar from '../../components/messaging/ContactAvatar';

// Constante pour l'URL de l'API backend
const BASE_API_URL = 'https://fadakcare-backend-1.onrender.com/api';

interface Alerte {
  id: number;
  message: string;
  dateEnvoi: string;
  expediteurId: number;
  destinataireId: number;
  expediteurRole: string;
  destinataireRole: string;
  expediteurNom: string;
  destinataireNom: string;
  lu: boolean;
  ExpediteurPhotoUrl?: string;
  DestinatairePhotoUrl?: string;
}

const PatientAlertesPage: React.FC = () => {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [medecinId, setMedecinId] = useState<number | null>(null);
  const [loading, setLoading] = useState({
    alertes: true,
    profile: true
  });

  const userId = parseInt(localStorage.getItem('userId') || '0');
  const userRole = localStorage.getItem('userRole');

  const fetchData = useCallback(async () => {
    try {
      setLoading({ alertes: true, profile: true });
      
      const [alertesRes, profilRes] = await Promise.all([
        HttpService.get<Alerte[]>(`${BASE_API_URL}/alerte/${userRole}/${userId}`),
        HttpService.get<{ medecinId?: number }>(`${BASE_API_URL}/compte/profil/patient/${userId}`)
      ]);
      if (!alertesRes.ok) throw new Error('Erreur lors du chargement des alertes');
      if (!profilRes.ok) throw new Error('Erreur lors de la récupération du profil');
      const alertesData = alertesRes.data || [];
      const profilData = profilRes.data || {};

      setAlertes(alertesData);
  setMedecinId(typeof profilData.medecinId === 'number' ? profilData.medecinId : null);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(errorMessage);
    } finally {
      setLoading({ alertes: false, profile: false });
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const envoyerAlerte = async () => {
    if (!nouveauMessage.trim()) {
      toast.error("Veuillez saisir un message");
      return;
    }

    if (!medecinId) {
      toast.error("Aucun médecin n'est associé à votre profil");
      return;
    }

    try {
  const res = await HttpService.post(`${BASE_API_URL}/alerte/envoyer`, {
        message: nouveauMessage,
        expediteurId: userId,
        destinataireId: medecinId,
        expediteurRole: 'patient',
        destinataireRole: 'doctor'
      });
      if (res.ok) {
        toast.success("Alerte envoyée avec succès !");
        setNouveauMessage('');
        await fetchData();
      } else {
        throw new Error("Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
      toast.error("Échec de l'envoi de l'alerte");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <>
      <PageMeta title="Mes Alertes - Patient" description="Consultez et envoyez des alertes à votre médecin" />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header unifié */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                <AlertIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes Alertes</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Communiquez avec votre médecin via le système d'alertes.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchData}
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800"
              >
                Actualiser
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-10">
            {/* Nouvelle alerte */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <PaperPlaneIcon className="w-5 h-5 text-blue-500 mr-2" />
                Envoyer une alerte à votre médecin
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Votre message
                  </label>
                  <textarea
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                    placeholder="Décrivez votre situation ou posez votre question..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Button
                    onClick={envoyerAlerte}
                    disabled={!nouveauMessage.trim() || loading.profile || !medecinId}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <PaperPlaneIcon className="w-5 h-5 mr-2" />
                    Envoyer l'alerte
                  </Button>
                  {!medecinId && (
                    <div className="flex items-center text-red-600 bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl">
                      <ErrorIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm">Aucun médecin n'est actuellement associé à votre profil</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Historique */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Historique des alertes</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">{alertes.length} message(s)</span>
              </div>
              {loading.alertes ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
              ) : alertes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                  <AlertIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-600 dark:text-gray-300 mb-2">Aucune alerte échangée</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vos conversations avec votre médecin apparaîtront ici.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertes.map((alerte) => (
                    <div
                      key={alerte.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          {alerte.expediteurRole === 'patient' ? 
                            <ContactAvatar nom={alerte.destinataireNom || 'Médecin'} photoUrl={alerte.DestinatairePhotoUrl} size="lg"/> : 
                            <ContactAvatar nom={alerte.expediteurNom || 'Patient'} photoUrl={alerte.ExpediteurPhotoUrl} size="lg"/>}
                          {!alerte.lu && alerte.expediteurRole !== 'patient' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {alerte.expediteurRole === 'patient' ? 
                                  `À: ${alerte.destinataireNom}` : 
                                  `De: ${alerte.expediteurNom}`}
                              </h3>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                alerte.expediteurRole === 'patient' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                              }`}>
                                {alerte.expediteurRole === 'patient' ? 'Envoyée' : 'Reçue'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(alerte.dateEnvoi)}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                            {alerte.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 100000 }}
      />
    </>
  );
};

export default PatientAlertesPage;
