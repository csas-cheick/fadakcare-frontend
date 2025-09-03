import { useState, useEffect, useRef } from 'react';
import { Patient, Medecin } from '../../types';
import { useModal } from '../../context/ModalContext';

interface AffectationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  medecins: Medecin[];
  onConfirm: (medecinId: number) => Promise<void>;
}

function AffectationModal({ 
  isOpen, 
  onClose, 
  patient, 
  medecins, 
  onConfirm 
}: AffectationModalProps) {
  const { setModalOpen } = useModal();
  const [selectedMedecin, setSelectedMedecin] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Gérer l'état du modal pour cacher le header
  useEffect(() => {
    setModalOpen(isOpen);
    return () => setModalOpen(false);
  }, [isOpen, setModalOpen]);

  // Auto focus select when modal opens
  useEffect(() => {
    if (isOpen && selectRef.current) {
      // Slight timeout to ensure element is in DOM after animation
      const t = setTimeout(() => selectRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedecin) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(selectedMedecin);
      setSelectedMedecin(0);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center px-4 py-8 text-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div
          className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="affectation-modal-title"
        >
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 id="affectation-modal-title" className="text-xl font-bold text-white">
                    Affecter un patient à un médecin
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    Sélectionnez un médecin pour lier ce patient
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer la fenêtre d'affectation"
                  title="Fermer"
                  className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Corps du modal */}
            <div className="bg-white dark:bg-gray-800 px-6 py-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Informations du patient */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="flex items-center text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Patient à affecter
                </span>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg">
                    {(patient?.nom || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{patient?.nom || 'Inconnu'}</p>
                    {patient?.email && <p className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</p>}
                  </div>
                </div>
              </div>

              {/* Sélection du médecin */}
              <div>
                <label htmlFor="medecin-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Sélectionner un médecin
                </label>
                <select
                  id="medecin-select"
                  ref={selectRef}
                  value={selectedMedecin}
                  onChange={(e) => setSelectedMedecin(Number(e.target.value))}
                  className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 px-4 py-3 text-gray-900 dark:text-white transition-all duration-200"
                  required
                >
                  <option value={0}>Choisir un médecin...</option>
                  {medecins.map((medecin) => (
                    <option key={medecin.id} value={medecin.id} className="bg-white dark:bg-gray-700">
                      Dr. {medecin.nom} ({medecin.specialite})
                    </option>
                  ))}
                </select>
              </div>
              {selectedMedecin !== 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Médecin sélectionné : Dr. {medecins.find(m => m.id === selectedMedecin)?.nom}
                  </div>
                </div>
              )}
            </div>

            {/* Footer moderne */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-xl bg-white dark:bg-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!selectedMedecin || isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmer l'affectation
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AffectationModal;
