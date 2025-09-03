import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { MedecinRendezVousService } from "../../services/medecinRendezVousService";
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    status: string;
    motif?: string;
    patientId: number;
    medecinId?: number;
    patientNom?: string;
  };
}

const MedecinCalendrierPage: React.FC = () => {
  const navigate = useNavigate();
  const medecinId = parseInt(localStorage.getItem("userId") || "0");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Redirection si pas d'ID médecin
  React.useEffect(() => {
    if (!medecinId) {
      navigate('/login');
    }
  }, [medecinId, navigate]);

  const loadRendezVous = useCallback(async () => {
    if (medecinId <= 0) return;
    
    setLoading(true);
    try {
      const rendezVousList = await MedecinRendezVousService.getMedecinRendezVous(medecinId);
      const calendarEvents = MedecinRendezVousService.convertToCalendarEvents(rendezVousList);
      setEvents(calendarEvents as CalendarEvent[]);
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous");
      console.error('Error loading rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  }, [medecinId]);

  useEffect(() => {
    loadRendezVous();
  }, [loadRendezVous]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      extendedProps: event.extendedProps
    } as CalendarEvent);
    openModal();
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;

    if (!window.confirm("Voulez-vous annuler ce rendez-vous ?")) return;

    try {
      await MedecinRendezVousService.deleteRendezVous(parseInt(selectedEvent.id));
      console.log("Rendez-vous annulé avec succès");
      closeModal();
      loadRendezVous();
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous");
      console.error('Error deleting rendez-vous:', error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedEvent?.id) return;

    try {
      await MedecinRendezVousService.updateRendezVousStatus(parseInt(selectedEvent.id), newStatus);
      console.log(`Rendez-vous ${newStatus} avec succès`);
      closeModal();
      loadRendezVous();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut");
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepté':
        return 'success';
      case 'refusé':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepté':
        return 'Accepté';
      case 'refusé':
        return 'Refusé';
      case 'en_attente':
        return 'En attente';
      default:
        return status;
    }
  };

  const resetModalFields = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta
        title="Mon Calendrier | Médecin - FadakCare"
        description="Visualisez vos rendez-vous médicaux dans un calendrier interactif"
      />
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Mon Calendrier
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualisez vos rendez-vous avec vos patients
              </p>
            </div>
            {loading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500 mr-2"></div>
                Chargement...
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="custom-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              locale="fr"
              buttonText={{
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour"
              }}
              dayHeaderFormat={{ weekday: 'long' }}
              eventDisplay="block"
              dayMaxEvents={3}
              moreLinkText="plus"
            />
          </div>
        </div>

        {/* Légende */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Légende :
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Accepté</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">En attente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Refusé</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détails du rendez-vous */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          resetModalFields();
        }}
        className="max-w-[500px] p-6 lg:p-8"
      >
        {selectedEvent && (
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Détails du rendez-vous
              </h2>
              <Badge color={getStatusBadgeColor(selectedEvent.extendedProps.status)}>
                {getStatusText(selectedEvent.extendedProps.status)}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Patient
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.extendedProps.patientNom || `Patient ID: ${selectedEvent.extendedProps.patientId}`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Motif
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.extendedProps.motif || 'Non spécifié'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Date et heure
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.start ? 
                    MedecinRendezVousService.formatDate(
                      selectedEvent.start instanceof Date 
                        ? selectedEvent.start.toISOString()
                        : selectedEvent.start.toString()
                    ) : 
                    'Non spécifiée'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  closeModal();
                  resetModalFields();
                }}
                variant="outline"
                className="flex-1"
              >
                Fermer
              </Button>
              
              {selectedEvent.extendedProps.status === 'en_attente' && (
                <>
                  <Button
                    onClick={() => handleUpdateStatus('accepté')}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    Accepter
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('refusé')}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    Refuser
                  </Button>
                </>
              )}
              
              {selectedEvent.extendedProps.status === 'accepté' && (
                <Button
                  onClick={handleDeleteEvent}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Annuler le RDV
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

const renderEventContent = (eventInfo: { event: { extendedProps: { status: string }; title: string }; timeText?: string }) => {
  const status = eventInfo.event.extendedProps.status;
  let colorClass = '';
  
  switch (status) {
    case 'accepté':
      colorClass = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      break;
    case 'refusé':
      colorClass = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      break;
    default:
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
  }

  return (
    <div className={`p-1 rounded-sm border text-xs ${colorClass}`}>
      <div className="font-medium truncate">{eventInfo.event.title}</div>
      {eventInfo.timeText && (
        <div className="opacity-75">{eventInfo.timeText}</div>
      )}
    </div>
  );
};

export default MedecinCalendrierPage;
