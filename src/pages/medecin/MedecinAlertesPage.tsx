import React, { useEffect, useState, useCallback } from 'react';
import { HttpService } from '../../services/httpService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import { AlertIcon, PaperPlaneIcon, ArrowRightIcon } from '../../icons';

// Constante pour l'URL du backend
const BACKEND_URL = 'https://fadakcare-backend-1.onrender.com/api';

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
}

interface Patient {
  id: number;
  nom: string;
}

const MedecinAlertesPage: React.FC = () => {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const userId = Number(localStorage.getItem("userId"));
  const userRole = localStorage.getItem('userRole');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [alertesRes, patientRes] = await Promise.all([
        HttpService.get<Alerte[]>(`${BACKEND_URL}/alerte/${userRole}/${userId}`),
        HttpService.get<Patient[]>(`${BACKEND_URL}/patients/medecin/${userId}`)
      ]);
      if (!alertesRes.ok || !patientRes.ok) throw new Error('Erreur lors du chargement des données');
      const alertesData = alertesRes.data || [];
      const patientData = patientRes.data || [];

      setAlertes(alertesData);
      setPatients(patientData);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const envoyerAlerte = async () => {
    if (!nouveauMessage.trim() || !selectedPatientId) {
      toast.error("Veuillez sélectionner un patient et saisir un message");
      return;
    }

    try {
      const res = await HttpService.post(`${BACKEND_URL}/alerte/envoyer`, {
        message: nouveauMessage,
        expediteurId: userId,
        destinataireId: selectedPatientId,
        expediteurRole: 'doctor',
        destinataireRole: 'patient'
      });
      if (res.ok) {
        toast.success("Alerte envoyée avec succès !");
        setNouveauMessage('');
        setSelectedPatientId(null);
        await fetchData();
      } else {
        throw new Error("Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
      toast.error("Échec de l'envoi de l'alerte");
    }
  };

  const filteredAlertes = alertes.filter(alerte => {
    if (filter === 'sent') return alerte.expediteurRole === 'doctor';
    if (filter === 'received') return alerte.destinataireRole === 'doctor';
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'doctor':
      case 'medecin':
        return 'bg-emerald-500';
      case 'patient':
        return 'bg-blue-500';
      case 'admin':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = (nom: string) => {
    return nom
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <PageMeta title="Gestion des Alertes - Médecin" description="Gérez et envoyez des alertes aux patients" />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          {/* Header unifié */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
                <AlertIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des Alertes</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Communiquez avec vos patients via le système d'alertes.</p>
              </div>
            </div>
            <Button
              onClick={fetchData}
              variant="outline"
              className="h-11 px-4 text-sm font-medium border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowRightIcon className="w-4 h-4 mr-2" /> Actualiser
            </Button>
          </div>

          {/* Nouvelle alerte */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <PaperPlaneIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mr-2" />
              Envoyer une nouvelle alerte
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="patient-destinataire" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient destinataire</label>
                <select
                  id="patient-destinataire"
                  aria-label="Patient destinataire"
                  title="Patient destinataire"
                  value={selectedPatientId || ''}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  rows={4}
                  placeholder="Tapez votre message ici..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={envoyerAlerte}
                disabled={!selectedPatientId || !nouveauMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <PaperPlaneIcon className="w-5 h-5 mr-2" /> Envoyer l'alerte
              </Button>
            </div>
          </div>

          {/* Historique */}
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historique des alertes</h2>
              <div className="flex flex-wrap gap-2">
                {[{ key: 'all', label: 'Toutes' }, { key: 'sent', label: 'Envoyées' }, { key: 'received', label: 'Reçues' }].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as 'all' | 'sent' | 'received')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filter === f.key
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : filteredAlertes.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <AlertIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aucune alerte {filter === 'sent' ? 'envoyée' : filter === 'received' ? 'reçue' : 'disponible'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">Les alertes apparaîtront ici une fois {filter === 'sent' ? 'envoyées' : filter === 'received' ? 'reçues' : 'disponibles'}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlertes.map(alerte => (
                  <div key={alerte.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 ${getAvatarColor(alerte.expediteurRole)} rounded-full flex items-center justify-center text-white font-semibold`}>{alerte.expediteurRole === 'doctor' ? getInitials(alerte.destinataireNom) : getInitials(alerte.expediteurNom)}</div>
                        {!alerte.lu && alerte.expediteurRole !== 'doctor' && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{alerte.expediteurRole === 'doctor' ? `À: ${alerte.destinataireNom}` : `De: ${alerte.expediteurNom}`}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${alerte.expediteurRole === 'doctor' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}`}>{alerte.expediteurRole === 'doctor' ? 'Envoyée' : 'Reçue'}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(alerte.dateEnvoi)}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{alerte.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default MedecinAlertesPage;
