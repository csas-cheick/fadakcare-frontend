import React, { useEffect, useState, useCallback } from 'react';
import Button from "../components/ui/button/Button";
import Badge from "../components/ui/badge/Badge";
import PageMeta from "../components/common/PageMeta";
import { NotificationContainer, showSuccess, showError } from "../components/ui/notification";
import { CalenderIcon, CheckCircleIcon, CloseIcon, UserCircleIcon } from "../icons";

interface RendezVous {
  id: number;
  date: string;
  etat: string;
  patientId: number;
  motif?: string;
  patient?: {
    nom: string;
  };
}

const MedecinRendezVous: React.FC = () => {
  const medecinId = parseInt(localStorage.getItem("userId") || "0");
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
  const [etatFiltre, setEtatFiltre] = useState<string>('en_attente');
  const [loading, setLoading] = useState(false);

  const fetchRendezVous = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5120/api/rendezvous/medecin/${medecinId}`);
      if (response.ok) {
        const data = await response.json();
        setRendezVousList(data);
      } else {
        showError("Erreur lors du chargement des rendez-vous");
      }
    } catch {
      showError("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, [medecinId]);

  useEffect(() => {
    fetchRendezVous();
  }, [fetchRendezVous]);

  const handleEtatChange = async (id: number, nouvelEtat: string) => {
    try {
      const res = await fetch(`http://localhost:5120/api/rendezvous/${id}/etat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouvelEtat),
      });
      if (res.ok) {
        showSuccess(`Rendez-vous ${nouvelEtat}`);
        fetchRendezVous();
      } else {
        showError("Échec de la mise à jour");
      }
    } catch {
      showError("Erreur de communication avec le serveur");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getBadgeColor = (etat: string) => {
    switch (etat) {
      case 'accepté':
        return 'success';
      case 'refusé':
        return 'error';
      default:
        return 'warning';
    }
  };

  const filteredList = rendezVousList.filter(rdv => rdv.etat === etatFiltre);

  const filterOptions = [
    { value: 'en_attente', label: 'En attente', count: rendezVousList.filter(r => r.etat === 'en_attente').length },
    { value: 'accepté', label: 'Acceptés', count: rendezVousList.filter(r => r.etat === 'accepté').length },
    { value: 'refusé', label: 'Refusés', count: rendezVousList.filter(r => r.etat === 'refusé').length },
  ];

  return (
    <>
      <PageMeta
        title="Gestion des Rendez-vous | FadakCare - Plateforme Médicale"
        description="Gérez les rendez-vous de vos patients - FadakCare Plateforme de Santé"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90 lg:text-3xl">
                Gestion des Rendez-vous
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Gérez les demandes de rendez-vous de vos patients
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 p-1 bg-gray-100 rounded-lg dark:bg-gray-800 w-fit">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEtatFiltre(option.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                    etatFiltre === option.value
                      ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-brand-400'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {option.label}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    etatFiltre === option.value
                      ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                  }`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-12 text-center">
              <CalenderIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                Aucun rendez-vous {etatFiltre}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {etatFiltre === 'en_attente' 
                  ? "Aucune nouvelle demande de rendez-vous"
                  : `Aucun rendez-vous ${etatFiltre} pour le moment`
                }
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {filteredList.map((rdv) => (
                <div
                  key={rdv.id}
                  className="flex flex-col gap-4 p-5 border border-gray-200 rounded-xl dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        Patient: {rdv.patient?.nom || `ID ${rdv.patientId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalenderIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatDate(rdv.date)}
                      </span>
                    </div>
                    {rdv.motif && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Motif:</span>
                        <span className="text-sm text-gray-800 dark:text-white/90">
                          {rdv.motif}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Statut:</span>
                      <Badge
                        variant="light"
                        color={getBadgeColor(rdv.etat)}
                        size="sm"
                      >
                        {rdv.etat}
                      </Badge>
                    </div>
                  </div>

                  {etatFiltre === 'en_attente' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEtatChange(rdv.id, 'accepté')}
                        startIcon={<CheckCircleIcon className="w-4 h-4" />}
                        className="bg-success-500 hover:bg-success-600 text-white"
                      >
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEtatChange(rdv.id, 'refusé')}
                        startIcon={<CloseIcon className="w-4 h-4" />}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-500/10"
                      >
                        Refuser
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <NotificationContainer />
    </>
  );
};

export default MedecinRendezVous;
