import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import DatePicker from "../../components/ui/DatePicker";
import TimePicker from "../../components/ui/TimePicker";
import { PencilIcon } from "../../icons";
import { TrashBinIcon } from "../../icons";
import StatCard from "../../components/common/StatCard";
import { TimeIcon, CheckCircleIcon, CloseIcon, ListIcon } from "../../icons";
import { RendezVousService, RendezVous } from "../../services/rendezVousService";

const PatientRendezVous: React.FC = () => {
  const patientId = parseInt(localStorage.getItem("userId") || "0");
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [etatFiltre, setEtatFiltre] = useState<'all' | 'en_attente' | 'accepté' | 'refusé'>('en_attente');
  const [modifId, setModifId] = useState<number | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const fetchRendezVous = useCallback(async () => {
    setLoading(true);
    try {
      const data = await RendezVousService.getPatientRendezVous(patientId);
      setRendezVousList(data);
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous");
      console.error('Error fetching rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId > 0) {
      fetchRendezVous();
    }
  }, [patientId, fetchRendezVous]);

  const handleSubmit = async () => {
    const validationError = RendezVousService.validateRendezVous(date, heure, motif);
    if (validationError) {
      console.warn(validationError);
      return;
    }

    const fullDate = `${date}T${heure}`;

    try {
      if (modifId) {
        // Modification
        await RendezVousService.updateRendezVous({
          id: modifId,
          date: fullDate,
          etat: "en_attente",
          motif,
          patientId
        });
        console.log("Rendez-vous modifié avec succès");
      } else {
        // Création
        await RendezVousService.createRendezVous({
          date: fullDate,
          etat: "en_attente",
          motif,
          patientId
        });
        console.log("Rendez-vous demandé avec succès");
      }
      
      resetForm();
      closeModal();
      fetchRendezVous();
    } catch (error) {
      console.error(modifId ? "Erreur lors de la modification" : "Erreur lors de la demande de rendez-vous");
      console.error('Error submitting rendez-vous:', error);
    }
  };

  const handleSupprimer = async (id: number) => {
    if (!window.confirm("Voulez-vous annuler ce rendez-vous ?")) return;

    try {
      await RendezVousService.deleteRendezVous(id);
      console.log("Rendez-vous annulé");
      fetchRendezVous();
    } catch (error) {
      console.error("Erreur lors de l'annulation");
      console.error('Error deleting rendez-vous:', error);
    }
  };

  const handleEdit = (rdv: RendezVous) => {
    const dt = new Date(rdv.date);
    setDate(dt.toISOString().split("T")[0]);
    setHeure(dt.toTimeString().slice(0, 5));
    setMotif(rdv.motif || '');
    setModifId(rdv.id);
    openModal();
  };

  const handleNewRendezVous = () => {
    resetForm();
    openModal();
  };

  const resetForm = () => {
    setDate('');
    setHeure('');
    setMotif('');
    setModifId(null);
  };

  const getStatusColor = (etat: string) => {
    switch (etat) {
      case 'accepté':
        return 'success';
      case 'refusé':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = (etat: string) => {
    switch (etat) {
      case 'accepté':
        return 'Accepté';
      case 'refusé':
        return 'Refusé';
      case 'en_attente':
        return 'En attente';
      default:
        return etat;
    }
  };

  // Statistiques et filtrage (même structure que médecin)
  const stats = useMemo(() => {
    const enAttente = rendezVousList.filter(rdv => rdv.etat === 'en_attente').length;
    const acceptes = rendezVousList.filter(rdv => rdv.etat === 'accepté').length;
    const refuses = rendezVousList.filter(rdv => rdv.etat === 'refusé').length;
    return { enAttente, acceptes, refuses, total: rendezVousList.length };
  }, [rendezVousList]);

  const filteredList = useMemo(() => {
    if (etatFiltre === 'all') return rendezVousList;
    return rendezVousList.filter(rdv => rdv.etat === etatFiltre);
  }, [rendezVousList, etatFiltre]);

  return (
    <>
      <PageMeta
        title="Mes Rendez-vous | FadakCare - Plateforme Médicale"
        description="Gérez vos rendez-vous médicaux - Demandez, modifiez ou annulez vos rendez-vous"
      />
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {/* Header aligné sur la page médecin */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300">
              <TimeIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes Rendez-vous</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Demandez, modifiez ou annulez vos rendez-vous.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEtatFiltre('en_attente')} className={`px-3 py-2 rounded-lg text-sm font-medium border ${etatFiltre==='en_attente' ? 'bg-teal-600 border-teal-600 text-white shadow-sm':'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>En attente ({stats.enAttente})</button>
            <button onClick={() => setEtatFiltre('accepté')} className={`px-3 py-2 rounded-lg text-sm font-medium border ${etatFiltre==='accepté' ? 'bg-green-600 border-green-600 text-white shadow-sm':'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Acceptés ({stats.acceptes})</button>
            <button onClick={() => setEtatFiltre('refusé')} className={`px-3 py-2 rounded-lg text-sm font-medium border ${etatFiltre==='refusé' ? 'bg-red-600 border-red-600 text-white shadow-sm':'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Refusés ({stats.refuses})</button>
            <Button onClick={handleNewRendezVous} className="bg-brand-500 hover:bg-brand-600">Nouveau Rendez-vous</Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <StatCard title="Total" value={stats.total} icon={<ListIcon className="w-5 h-5" />} color="blue" />
            <StatCard title="En attente" value={stats.enAttente} icon={<TimeIcon className="w-5 h-5" />} color="yellow" />
            <StatCard title="Acceptés" value={stats.acceptes} icon={<CheckCircleIcon className="w-5 h-5" />} color="green" />
            <StatCard title="Refusés" value={stats.refuses} icon={<CloseIcon className="w-5 h-5" />} color="red" />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6V9m-1 0H6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-1z" /></svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun rendez-vous {etatFiltre === 'en_attente' ? 'en attente' : etatFiltre === 'all' ? 'disponible' : etatFiltre}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{etatFiltre === 'en_attente' ? "Vous n'avez pas de nouvelles demandes de rendez-vous." : `Aucun rendez-vous ${etatFiltre} pour le moment.`}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map((rdv) => (
                <div
                  key={rdv.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {rdv.motif || 'Consultation'}
                        </h3>
                        <Badge color={getStatusColor(rdv.etat)}>
                          {getStatusText(rdv.etat)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {RendezVousService.formatDate(rdv.date)}
                      </p>
                    </div>

                    {rdv.etat === 'en_attente' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(rdv)}
                          className="p-2 text-gray-500 hover:text-brand-600 hover:bg-gray-50 rounded-md dark:hover:bg-gray-800"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSupprimer(rdv.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-md dark:hover:bg-gray-800"
                          title="Supprimer"
                        >
                          <TrashBinIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal pour ajouter/modifier un rendez-vous */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-8"
      >
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {modifId ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {modifId ? 'Modifiez les informations de votre rendez-vous' : 'Remplissez les informations pour demander un rendez-vous'}
            </p>
          </div>

          <div className="space-y-4">
            <DatePicker
              label="Date"
              value={date}
              onChange={setDate}
              placeholder="Sélectionner une date"
              minDate={new Date().toISOString().split('T')[0]} // Empêcher les dates passées
            />

            <TimePicker
              label="Heure"
              value={heure}
              onChange={setHeure}
              placeholder="Sélectionner une heure"
              minTime="08:00"
              maxTime="18:00"
              step={15} // Créneaux de 15 minutes
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Motif de consultation
              </label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={3}
                placeholder="Décrivez brièvement le motif de votre consultation..."
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={closeModal}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600"
            >
              {modifId ? 'Modifier' : 'Demander'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PatientRendezVous;
