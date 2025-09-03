import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import { MedecinPatientsService, PatientDetailsWithResults, DepistageResult } from '../../services/medecinPatientsService';

const ScoreCircle = ({ score, size = 80 }: { score: number; size?: number }) => {
  const percentage = Math.min(100, Math.max(0, score * 10));
  const hue = ((100 - percentage) * 120) / 100;
  const color = `hsl(${hue}, 100%, 45%)`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="block w-full h-full">
        <path
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="2"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold flex items-baseline"
        style={{ 
          color,
          fontSize: size * 0.25,
          lineHeight: 1
        }}
      >
        {score}
        <span 
          className="opacity-70 ml-1"
          style={{ fontSize: size * 0.15 }}
        >
          /10
        </span>
      </div>
    </div>
  );
};

const PatientResultatsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetailsWithResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResultats = async () => {
      if (!patientId) {
        setError('ID patient manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await MedecinPatientsService.getPatientResultatsDetails(parseInt(patientId));
        setPatient(data);
      } catch (err) {
        console.error("Erreur de récupération:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchResultats();
  }, [patientId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return new Intl.DateTimeFormat('fr-FR', { 
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

  const getInitials = (nom: string) => {
    const names = nom.split(' ');
    return names.length > 1 
      ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      : `${nom.charAt(0)}`.toUpperCase();
  };

  const getScoreBadgeColor = (score: number) => {
    if (score < 4) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (score < 7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Résultats Patient | Médecin" description="Résultats de dépistage du patient" />
        <LoadingSpinner 
          size="large" 
          text="Chargement des résultats..." 
          className="min-h-[400px]"
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta title="Résultats Patient | Médecin" description="Erreur lors du chargement" />
        <ErrorAlert 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <PageMeta title="Résultats Patient | Médecin" description="Patient non trouvé" />
        <ErrorAlert 
          message="Patient non trouvé" 
          onRetry={() => navigate('/medecin/mes-patients')}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title={`Résultats de ${patient.nom} | Médecin`} description={`Historique des dépistages de ${patient.nom}`} />
      
      <div className="mx-auto max-w-7xl">
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
          
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(patient.nom)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{patient.nom}</h1>
                <p className="text-teal-100 mt-1">{patient.email}</p>
                <div className="flex items-center text-teal-100 text-sm mt-1 space-x-4">
                  <span>Né le: {formatDate(patient.dateNaissance)}</span>
                  <span>Profession: {patient.profession}</span>
                  <span>Téléphone: {patient.telephone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Titre historique */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historique des dépistages
          </h2>
        </div>

        {/* Résultats */}
        {patient.resultats.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-boxdark dark:border-strokedark">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun dépistage effectué</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ce patient n'a pas encore complété de questionnaire de dépistage.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {patient.resultats.map((resultat: DepistageResult) => (
              <div 
                key={resultat.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow dark:bg-boxdark dark:border-strokedark"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Dépistage #{resultat.numeroDepistage}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Effectué le {formatDate(resultat.dateDepistage)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0 ${getScoreBadgeColor(resultat.score)}`}>
                    Score: {resultat.score}/10
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Score Circle et Legend */}
                  <div className="flex flex-col items-center space-y-4">
                    <ScoreCircle score={resultat.score} size={150} />
                    <div className="w-full max-w-xs">
                      <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Faible</span>
                        <span>Moyen</span>
                        <span>Élevé</span>
                      </div>
                    </div>
                  </div>

                  {/* Analyse */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Analyse médicale :
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {resultat.analyse}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PatientResultatsPage;
