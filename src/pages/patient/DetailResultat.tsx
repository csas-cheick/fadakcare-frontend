import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import { ScoreCircle, ScoreBadge, ScoreLegend } from '../../components/resultats';
import { PatientResult, ResultatService, DepistageReponses } from '../../services/resultatService';
import { ReportService } from '../../services/reportService';
import { useGoBack } from '../../hooks';

const DetailResultat = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();
  
  const [resultat, setResultat] = useState<PatientResult | null>(
    location.state?.resultat || null
  );
  const [loading, setLoading] = useState(!resultat);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Etat pour le modal des réponses
  const [showReponses, setShowReponses] = useState(false); // état modal réponses
  const [reponsesData, setReponsesData] = useState<DepistageReponses | null>(null);
  const [reponsesLoading, setReponsesLoading] = useState(false);
  const [reponsesError, setReponsesError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultat && id) {
      const fetchResultat = async () => {
        try {
          setLoading(true);
          const data = await ResultatService.getResultatById(parseInt(id));
          setResultat(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
          setLoading(false);
        }
      };

      fetchResultat();
    }
  }, [id, resultat]);

  const handleDownloadReport = async () => {
    if (!resultat) return;
    
    try {
      setDownloadLoading(true);
      setDownloadError(null);
      
      // Essayer d'abord l'API, puis fallback vers la génération locale
      try {
        await ReportService.downloadReportFromApi(resultat.id);
      } catch (apiError) {
        console.warn('API indisponible, génération locale du rapport:', apiError);
        await ReportService.downloadResultatReport(resultat);
      }
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setDownloadError('Impossible de télécharger le rapport. Veuillez réessayer.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleNewDepistage = () => {
    navigate('/patient/depistage');
  };

  const openReponsesModal = async () => { // ouverture + fetch lazy
    if (!resultat) return;
    setShowReponses(true);
    if (reponsesData || reponsesLoading) return; // pas de refetch si déjà là
    if (!resultat.depistageId) {
      setReponsesError("Identifiant de dépistage indisponible.");
      return;
    }
    try {
      setReponsesLoading(true);
      setReponsesError(null);
      const data = await ResultatService.getDepistageReponses(resultat.depistageId);
      setReponsesData(data);
    } catch (err) {
      setReponsesError(err instanceof Error ? err.message : 'Erreur de chargement des réponses');
    } finally {
      setReponsesLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Détail du résultat" description="Détail du résultat de dépistage" />
        <LoadingSpinner 
          size="large" 
          text="Chargement du résultat..." 
          className="min-h-[400px]"
        />
      </>
    );
  }

  if (error || !resultat) {
    return (
      <>
        <PageMeta title="Détail du résultat" description="Erreur lors du chargement du résultat" />
        <ErrorAlert 
          message={error || "Résultat non trouvé"} 
          onRetry={() => window.location.reload()}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta 
        title={`Dépistage #${resultat.numeroDepistage}`}
        description={`Détail du résultat de dépistage effectué le ${ResultatService.formatDate(resultat.dateDepistage)}`}
      />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={goBack}
              className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dépistage #{resultat.numeroDepistage}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Effectué le {ResultatService.formatDate(resultat.dateDepistage)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Score Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Score d'évaluation
                </h2>
                <ScoreCircle score={resultat.score} size={200} />
                <div className="mt-6">
                  <ScoreLegend size={250} />
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Évaluation du risque
                  </h3>
                  <ScoreBadge score={resultat.score} />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Interprétation du score
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p><strong>0-3 :</strong> Risque faible - Surveillance régulière recommandée</p>
                    <p><strong>4-6 :</strong> Risque modéré - Suivi médical conseillé</p>
                    <p><strong>7-10 :</strong> Risque élevé - Consultation médicale urgente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Analyse médicale détaillée
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {resultat.analyse}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recommandations
            </h2>
            <div className="space-y-3">
              {resultat.score < 4 ? (
                <>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Poursuivez vos bonnes habitudes de vie</p>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Surveillance régulière recommandée</p>
                  </div>
                </>
              ) : resultat.score < 7 ? (
                <>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Consultez votre médecin dans les prochaines semaines</p>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Suivi médical régulier conseillé</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Consultation médicale urgente recommandée</p>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Ne tardez pas à contacter votre médecin</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {downloadError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{downloadError}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadReport}
                disabled={downloadLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Génération du rapport...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Télécharger le rapport complet
                  </>
                )}
              </button>

              <button
                onClick={handleNewDepistage}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau dépistage
              </button>
            </div>

            <div>
              <button
                onClick={openReponsesModal}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h6" />
                </svg>
                Voir les réponses détaillées
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReponses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReponses(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Réponses du dépistage</h3>
              <button onClick={() => setShowReponses(false)} aria-label="Fermer le modal" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {reponsesLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
              {reponsesError && (
                <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {reponsesError}
                </div>
              )}
              {reponsesData && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Effectué le {ResultatService.formatDate(reponsesData.dateDepistage)}</p>
                    {typeof reponsesData.score === 'number' && (
                      <p>Score: <span className="font-medium text-gray-900 dark:text-white">{reponsesData.score}</span></p>
                    )}
                  </div>
                  <ul className="space-y-4">
                    {reponsesData.reponses.map(r => (
                      <li key={r.questionId} className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-700">
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
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowReponses(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg"
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

export default DetailResultat;
