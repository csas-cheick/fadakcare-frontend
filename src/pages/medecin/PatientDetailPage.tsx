import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import { MedecinPatientsService } from '../../services/medecinPatientsService';
import { Patient } from '../../types';
import { ResultatService, DepistageReponses } from '../../services/resultatService';
import { ReportService } from '../../services/reportService';
import { ScoreCircle, ScoreBadge, ScoreLegend } from '../../components/resultats';
import ContactAvatar from '../../components/messaging/ContactAvatar';

interface PatientDetail extends Patient {
  adresse?: string;
  sexe?: string;
  numeroSecu?: string;
  medecinId?: number;
}

interface ApiResultat {
  id?: number; Id?: number;
  depistageId?: number; DepistageId?: number;
  numeroDepistage?: number; NumeroDepistage?: number;
  score?: number; Score?: number;
  analyse?: string; Analyse?: string;
  dateDepistage?: string; DateDepistage?: string;
  questionnaireNom?: string;
  dateCreation?: string;
}

interface DepistageResult {
  id: number;
  depistageId: number | null;
  questionnaireNom: string;
  dateCreation: string;
  resultats: Array<{
    question: string;
    reponse: string;
    score?: number | null;
  }>;
  score?: number | null;
  analyse?: string;
}

const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [depistages, setDepistages] = useState<DepistageResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'informations' | 'depistages'>('informations');

  // État pour les réponses détaillées
  const [showReponsesModal, setShowReponsesModal] = useState(false);
  const [reponsesLoading, setReponsesLoading] = useState(false);
  const [reponsesError, setReponsesError] = useState<string | null>(null);
  const [reponsesData, setReponsesData] = useState<DepistageReponses | null>(null);
  const [selectedDepistageLabel, setSelectedDepistageLabel] = useState<string>('');

  // Etat pour modal détail complet
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDepistage, setSelectedDepistage] = useState<DepistageResult | null>(null);
  const [detailDownloadLoading, setDetailDownloadLoading] = useState(false);
  const [detailDownloadError, setDetailDownloadError] = useState<string | null>(null);

  // Empêcher le scroll de fond et s'assurer que le header est masqué derrière le modal
  useEffect(() => {
    if (showReponsesModal) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      return () => {
        document.body.style.overflow = previousOverflow;
        document.body.classList.remove('modal-open');
      };
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showReponsesModal]);

  // Appliquer aussi pour le modal détail complet
  useEffect(() => {
    if (showDetailModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      return () => {
        document.body.style.overflow = prev;
        document.body.classList.remove('modal-open');
      };
    }
  }, [showDetailModal]);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!patientId) {
        setError('ID patient manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('[PatientDetail] Fetching patient details for', patientId);
        const patientData = await MedecinPatientsService.getPatientDetails(parseInt(patientId));
        console.log('[PatientDetail] patientData raw:', patientData);
        setPatient(patientData as PatientDetail);

        console.log('[PatientDetail] Fetching depistages for', patientId);
        const depistagesData = await MedecinPatientsService.getPatientDepistages(parseInt(patientId));
        console.log('[PatientDetail] depistagesData raw:', depistagesData);

        const isResultatShape = (obj: unknown): obj is ApiResultat => {
          if (typeof obj !== 'object' || obj === null) return false;
            const o = obj as Record<string, unknown>;
            return 'analyse' in o || 'Analyse' in o || 'score' in o || 'Score' in o || 'numeroDepistage' in o || 'NumeroDepistage' in o;
        };
        const mapped: DepistageResult[] = Array.isArray(depistagesData)
          ? depistagesData.filter(isResultatShape).map(r => {
              const numero = r.numeroDepistage ?? r.NumeroDepistage;
              const scoreVal = r.score ?? r.Score ?? null;
              const analyseVal = r.analyse ?? r.Analyse ?? 'Aucune analyse';
              const dateVal = r.dateDepistage ?? r.DateDepistage ?? r.dateCreation ?? new Date().toISOString();
              const depId = r.depistageId ?? r.DepistageId ?? null;
              return {
                id: r.id ?? r.Id ?? Math.random(),
                depistageId: depId,
                questionnaireNom: numero ? `Dépistage #${numero}` : r.questionnaireNom || 'Dépistage',
                dateCreation: dateVal,
                score: scoreVal,
                analyse: analyseVal,
                resultats: [
                  {
                    question: 'Score global',
                    reponse: scoreVal != null ? String(scoreVal) : 'N/A',
                    score: scoreVal
                  },
                  {
                    question: 'Analyse',
                    reponse: analyseVal
                  }
                ]
              } as DepistageResult;
            })
          : [];
        setDepistages(mapped);
      } catch (err) {
        console.error('[PatientDetail] erreur fetch:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId]);

  const openReponses = async (depistage: DepistageResult) => {
    if (!depistage.depistageId) {
      setReponsesError('Identifiant dépistage introuvable.');
      setShowReponsesModal(true);
      return;
    }
    setSelectedDepistageLabel(depistage.questionnaireNom);
    setShowReponsesModal(true);
    setReponsesError(null);
    setReponsesData(null);
    try {
      setReponsesLoading(true);
      const data = await ResultatService.getDepistageReponses(depistage.depistageId);
      setReponsesData(data);
    } catch (e) {
      setReponsesError(e instanceof Error ? e.message : 'Erreur de récupération');
    } finally {
      setReponsesLoading(false);
    }
  };

  const openDetailModal = (depistage: DepistageResult) => {
    setSelectedDepistage(depistage);
    setShowDetailModal(true);
    setDetailDownloadError(null);
  };

  const handleDownloadReport = async () => {
    if (!selectedDepistage) return;
    try {
      setDetailDownloadLoading(true);
      setDetailDownloadError(null);
      try {
        await ReportService.downloadReportFromApi(selectedDepistage.id);
  } catch {
        // fallback génération locale (nécessite champs similaires)
        await ReportService.downloadResultatReport({
          id: selectedDepistage.id,
          depistageId: selectedDepistage.depistageId || 0,
          numeroDepistage: parseInt(selectedDepistage.questionnaireNom.replace(/[^0-9]/g, '')) || selectedDepistage.id,
          score: selectedDepistage.score || 0,
          analyse: selectedDepistage.analyse || 'Aucune analyse',
          dateDepistage: selectedDepistage.dateCreation,
        } as unknown as {
          id: number; depistageId: number; numeroDepistage: number; score: number; analyse: string; dateDepistage: string;
        });
      }
  } catch {
      setDetailDownloadError('Téléchargement impossible. Réessayez.');
    } finally {
      setDetailDownloadLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? dateString 
        : new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatDateOfBirth = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const age = Math.floor((new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return `${new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)} (${age} ans)`;
    } catch {
      return dateString;
    }
  };



  if (loading) {
    return (
      <>
        <PageMeta title="Détail Patient | Médecin" description="Détails du patient" />
        <LoadingSpinner 
          size="large" 
          text="Chargement des informations patient..." 
          className="min-h-[400px]"
        />
      </>
    );
  }

  if (error || !patient) {
    return (
      <>
        <PageMeta title="Détail Patient | Médecin" description="Détails du patient" />
        <ErrorAlert 
          message={error || 'Patient non trouvé'} 
          onRetry={() => window.location.reload()}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${patient.nom} | Détail Patient`} description={`Informations détaillées de ${patient.nom}`} />
      
  <div className="mx-auto max-w-7xl text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header avec retour */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/medecin/mes-patients')}
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4 transition-colors dark:text-teal-400 dark:hover:text-teal-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à mes patients
          </button>
          
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-800 dark:to-cyan-900 rounded-xl p-6 text-white transition-colors">
            <div className="flex items-center space-x-6">
              <ContactAvatar 
                nom={patient.nom} 
                photoUrl={patient.photoUrl} 
                size="xl" 
              />
              <div>
                <h1 className="text-3xl font-bold">{patient.nom}</h1>
                <p className="text-teal-100 mt-1">{patient.email}</p>
                <p className="text-teal-100 text-sm mt-1">
                  Patient depuis {formatDateOfBirth(patient.dateNaissance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('informations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'informations'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Informations personnelles
              </button>
              <button
                onClick={() => setActiveTab('depistages')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'depistages'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Dépistages ({depistages.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'informations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations de base */}
            <div className="bg-white/95 dark:bg-gray-900/70 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/50 p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Informations de base
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                    <p className="font-medium text-gray-900 dark:text-white">{patient.nom}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{patient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{patient.telephone || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6V9m-1 0H6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-1z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sexe</p>
                    <p className="font-medium text-gray-900 dark:text-white">{patient.sexe || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="bg-white/95 dark:bg-gray-900/70 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/50 p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Informations médicales
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6V9m-1 0H6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-1z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Numéro de sécurité sociale</p>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">
                      {patient.numeroSecu || 'Non renseigné'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6V9m-1 0H6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-1z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date de naissance</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDateOfBirth(patient.dateNaissance)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {patient.adresse || 'Non renseignée'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'depistages' && (
          <div className="space-y-6">
            {depistages.length === 0 ? (
              <div className="text-center py-12 bg-white/95 dark:bg-gray-900/70 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/50 transition-colors">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun dépistage</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Ce patient n'a pas encore effectué de dépistage.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {depistages.map((depistage) => (
                  <div
                    key={depistage.id}
                    className="bg-white/95 dark:bg-gray-900/70 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/50 p-6 transition-colors hover:border-gray-200 dark:hover:border-gray-500/70"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {depistage.questionnaireNom}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(depistage.dateCreation)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {depistage.score != null && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
                          Score: {depistage.score}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                      {depistage.analyse}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => openDetailModal(depistage)}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:focus:ring-teal-400/40 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Voir détail complet
                      </button>
                      <button
                        onClick={() => openReponses(depistage)}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-indigo-400/40 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h6" />
                        </svg>
                        Voir réponses
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showReponsesModal && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">{/* z élevé pour recouvrir le header */}
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors" onClick={() => setShowReponsesModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700/60 transition-colors">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700/60">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDepistageLabel} - Réponses</h3>
              <button
                onClick={() => setShowReponsesModal(false)}
                aria-label="Fermer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {reponsesLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              )}
              {reponsesError && !reponsesLoading && (
                <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {reponsesError}
                </div>
              )}
              {reponsesData && !reponsesLoading && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Date: {ResultatService.formatDate(reponsesData.dateDepistage)}</p>
                    {typeof reponsesData.score === 'number' && (
                      <p>Score: <span className="font-medium text-gray-900 dark:text-white">{reponsesData.score}</span></p>
                    )}
                  </div>
                  <ul className="space-y-4">
                    {reponsesData.reponses.map(r => (
                      <li key={r.questionId} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/60 transition-colors">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">{r.questionText}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {r.valeur === null || r.valeur === '' ? <span className="italic text-gray-400">(Aucune réponse)</span> : r.valeur}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!reponsesLoading && !reponsesError && !reponsesData && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700/60 flex justify-end">
              <button
                onClick={() => setShowReponsesModal(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/40 dark:focus:ring-gray-400/40"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      {showDetailModal && selectedDepistage && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détail complet - {selectedDepistage.questionnaireNom}</h3>
              <button onClick={() => setShowDetailModal(false)} aria-label="Fermer" title="Fermer" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center justify-start text-center">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Score d'évaluation</h4>
                  <div className="flex flex-col items-center gap-6 w-full">
                    <ScoreCircle score={selectedDepistage.score || 0} size={180} />
                    <ScoreLegend size={220} />
                    <ScoreBadge score={selectedDepistage.score || 0} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Analyse médicale</h4>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {selectedDepistage.analyse}
                    </p>
                  </div>
                  <div className="mt-6">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommandations</h5>
                    <Recommendations score={selectedDepistage.score || 0} />
                  </div>
                </div>
              </div>
              {detailDownloadError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{detailDownloadError}</div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadReport}
                  disabled={detailDownloadLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {detailDownloadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Génération du rapport...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Télécharger le rapport
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setShowDetailModal(false); openReponses(selectedDepistage); }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h6" /></svg>
                  Voir les réponses
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Modal détail complet (injection après composant principal pour clarté)
// placé en dehors du return principal pour éviter re-rendus lourds

const Recommendations: React.FC<{ score: number }> = ({ score }) => {
  if (score < 4) {
    return (
      <div className="space-y-2">
        <RecItem color="green" text="Poursuivez vos bonnes habitudes de vie" />
        <RecItem color="green" text="Surveillance régulière recommandée" />
        <RecItem color="green" text="Maintenez une hygiène de vie équilibrée" />
      </div>
    );
  } else if (score < 7) {
    return (
      <div className="space-y-2">
        <RecItem color="yellow" text="Planifiez une consultation de suivi" />
        <RecItem color="yellow" text="Adoptez des mesures préventives adaptées" />
        <RecItem color="yellow" text="Surveillance rapprochée conseillée" />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <RecItem color="red" text="Consultation médicale urgente recommandée" />
      <RecItem color="red" text="Ne tardez pas à contacter un spécialiste" />
      <RecItem color="red" text="Surveillance intensive nécessaire" />
    </div>
  );
};

const RecItem: React.FC<{ color: 'green' | 'yellow' | 'red'; text: string }> = ({ color, text }) => {
  const colorMap: Record<string, string> = {
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500'
  };
  return (
    <div className="flex items-start">
      <svg className={`w-5 h-5 mr-2 mt-0.5 ${colorMap[color]}`} fill="currentColor" viewBox="0 0 20 20">
        {color === 'yellow' ? (
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        ) : color === 'red' ? (
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        )}
      </svg>
      <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  );
};

// Inject modal JSX at document body level using portal? Simplicity: append at end when showDetailModal & selectedDepistage are truthy
// (Since we can't modify root, we replicate conditional markup appended in component tree.)

// NOTE: The actual modal markup insertion must be inside component; patch again to insert conditional rendering above existing export.


export default PatientDetailPage;
