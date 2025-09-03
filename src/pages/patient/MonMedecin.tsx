import PageMeta from '../../components/common/PageMeta';
import { useMedecin } from '../../hooks/useMedecin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import MedecinCard from '../../components/medecin/MedecinCard';
import EmptyMedecinState from '../../components/medecin/EmptyMedecinState';

const MonMedecin = () => {
  const patientId = parseInt(localStorage.getItem('userId') || '0');
  const { medecin, loading, error, refetch } = useMedecin(patientId);

  if (loading) {
    return (
      <>
        <PageMeta title="Mon Médecin" description="Informations sur votre médecin traitant" />
        <LoadingSpinner 
          size="large" 
          text="Chargement des informations du médecin..." 
          className="min-h-[400px]"
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title="Mon Médecin" description="Informations sur votre médecin traitant" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Mon Médecin</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informations sur votre médecin traitant</p>
              </div>
              {/* Espace réservé pour une future action (ex: Changer de médecin) */}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error ? (
              <ErrorAlert message={error} onRetry={refetch} />
            ) : medecin ? (
              <MedecinCard medecin={medecin} />
            ) : (
              <EmptyMedecinState />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MonMedecin;
