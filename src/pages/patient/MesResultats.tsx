import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { LoadingSpinner, ErrorAlert } from '../../components/common';
import { ResultatCard, EmptyResultatsState } from '../../components/resultats';
import { useResultats } from '../../hooks/useResultats';
import { PatientResult } from '../../services/resultatService';

const MesResultats = () => {
  const navigate = useNavigate();
  const patientId = parseInt(localStorage.getItem('userId') || '0');
  const { resultats, loading, error, refetch } = useResultats(patientId);

  const lastDepistage = useMemo(() => {
    if (!resultats.length) return null;
    const dates = resultats
      .map(r => {
        const raw = r.dateDepistage?.trim();
        if (!raw) return null;
        const ts = Date.parse(raw);
        if (!isNaN(ts)) return new Date(ts);
        const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2}))?$/);
        if (m) {
          const [, d, mo, y, hh = '00', mm = '00'] = m;
          const isoLike = `${y}-${mo}-${d}T${hh}:${mm}:00`;
          const ts2 = Date.parse(isoLike);
          if (!isNaN(ts2)) return new Date(ts2);
        }
        return null;
      })
      .filter((d): d is Date => !!d);
    if (!dates.length) return null;
    return dates.sort((a, b) => b.getTime() - a.getTime())[0];
  }, [resultats]);

  const handleViewDetails = (resultat: PatientResult) => {
    navigate(`/patient/resultats/${resultat.id}`, { state: { resultat } });
  };

  const handleNewDepistage = () => {
    navigate('/patient/depistage');
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Mes Résultats" description="Historique de vos évaluations médicales" />
        <LoadingSpinner size="large" text="Chargement de vos résultats..." className="min-h-[400px]" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta title="Mes Résultats" description="Historique de vos évaluations médicales" />
        <ErrorAlert message={error || ''} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Mes Résultats | FadakCare - Plateforme Médicale"
        description="Historique de vos évaluations médicales"
      />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes Résultats</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Historique de vos évaluations médicales et analyses
                </p>
              </div>
              {resultats.length > 0 && (
                <button
                  onClick={handleNewDepistage}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau dépistage
                </button>
              )}
            </div>
            {resultats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des dépistages</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{resultats.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Score moyen</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(resultats.reduce((s, r) => s + r.score, 0) / resultats.length).toFixed(1)}/10</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernier dépistage</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {lastDepistage ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(lastDepistage) : 'Aucun'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            {resultats.length === 0 ? (
              <EmptyResultatsState onNewDepistage={handleNewDepistage} />
            ) : (
              <div className="space-y-6">
                {resultats.map(resultat => (
                  <ResultatCard key={resultat.id} resultat={resultat} onViewDetails={handleViewDetails} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MesResultats;
