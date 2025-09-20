import { useState } from 'react';
import { PatientResult, ResultatService } from '../../services/resultatService';
import { ReportService } from '../../services/reportService';
import ScoreCircle from './ScoreCircle';
import ScoreBadge from './ScoreBadge';
import ScoreLegend from './ScoreLegend';

interface ResultatCardProps {
  resultat: PatientResult;
  onViewDetails?: (resultat: PatientResult) => void;
}

const ResultatCard = ({ resultat, onViewDetails }: ResultatCardProps) => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(resultat);
    }
  };

  const handleDownloadReport = async () => {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <div className="mb-2 sm:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dépistage #{resultat.numeroDepistage}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Effectué le {ResultatService.formatDate(resultat.dateDepistage)}
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <ScoreBadge score={resultat.score} />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Score Circle */}
        <div className="flex flex-col items-center space-y-3">
          <ScoreCircle score={resultat.score} size={120} />
          <ScoreLegend size={150} />
        </div>

        {/* Analysis */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Analyse médicale :
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {resultat.analyse.length > 200 
                ? `${resultat.analyse.substring(0, 200)}...` 
                : resultat.analyse
              }
            </p>
            {resultat.analyse.length > 200 && onViewDetails && (
              <button
                onClick={handleViewDetails}
                className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Voir plus →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        {downloadError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{downloadError}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          {onViewDetails && (
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Voir le détail complet
            </button>
          )}
          <button 
            onClick={handleDownloadReport}
            disabled={downloadLoading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {downloadLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Téléchargement...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger le rapport
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultatCard;
