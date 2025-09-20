import { useEffect, useState, useCallback } from 'react';
import { HttpService } from '../../services/httpService';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import { 
  ChevronLeftIcon, 
  AngleRightIcon, 
  CheckCircleIcon,
  AlertIcon,
  ArrowRightIcon
} from '../../icons';
import { Questionnaire, Question } from '../../types';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';
const DEFAULT_OPTIONS = {
  'choix unique': ['Oui', 'Non', 'Parfois'],
  'choix multiple': ['Option A', 'Option B', 'Option C'],
  select: ['Option 1', 'Option 2', 'Option 3'] // défaut pour compat
};

export default function DepistagePatientPage() {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string | string[] | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [showSummary, setShowSummary] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  useEffect(() => {
    const fetchWithPrefill = async () => {
      const patientId = parseInt(localStorage.getItem('userId') || '3');
      try {
        // Tente d'abord l'endpoint avec pré-remplissage
        let dataResp = await HttpService.get<Questionnaire[]>(`${API_BASE_URL}/depistage/prefill/${patientId}`);
        if (!dataResp.ok) {
          dataResp = await HttpService.get<Questionnaire[]>(`${API_BASE_URL}/admin/depistage/liste`);
        }
        if (!dataResp.ok) throw new Error(`Erreur questionnaires (${dataResp.status})`);
        const data = dataResp.data || [];
        setQuestionnaires(data);

        // Construire l'état des réponses initiales
  const initial: Record<number, string | string[] | boolean> = {};
        data.forEach(qnr => qnr.questions.forEach(q => {
          if (q.derniereReponse != null && q.derniereReponse !== '') {
            let val: string | string[] | boolean = q.derniereReponse;
            // Tentative de parse JSON pour choix multiple
            if (q.type === 'choix multiple') {
              try { val = JSON.parse(q.derniereReponse); } catch { /* ignore */ }
            }
            if (q.type === 'numérique') {
              // conserver chaîne pour input number
              val = q.derniereReponse;
            }
            if (q.type === 'booléen') {
              // rester en chaîne 'true'/'false' pour correspondre à la soumission
              val = (q.derniereReponse === 'true').toString();
            }
            initial[q.id] = val;
          }
        }));
        setResponses(initial);
  if (Object.keys(initial).length > 0) setHasPrefilled(true);
      } catch (err) {
        setError('Erreur lors du chargement des questionnaires');
        console.error('Erreur chargement questionnaires:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWithPrefill();
  }, []);

  // Handlers
  const handleChange = useCallback((questionId: number, value: string | boolean) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleCheckbox = useCallback((questionId: number, option: string) => {
    setResponses(prev => {
      const currentValues = prev[questionId] as string[] || [];
      const updatedValues = currentValues.includes(option)
        ? currentValues.filter((o: string) => o !== option)
        : [...currentValues, option];
      return { ...prev, [questionId]: updatedValues };
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < questionnaires.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questionnaires.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    setSubmitStatus('loading');
    try {
      const patientId = parseInt(localStorage.getItem('userId') || '3');
      const payload = {
        idPatient: patientId,
        reponses: Object.entries(responses).map(([questionId, valeur]) => ({
          questionId: Number(questionId),
          valeur: typeof valeur === 'string' ? valeur : JSON.stringify(valeur)
        }))
      };

  const resp = await HttpService.post(`${API_BASE_URL}/depistage/seDepister`, payload);
  if (!resp.ok) throw new Error('Erreur lors de l\'envoi');

      setSubmitStatus('success');
      setResponses({});
      setCurrentIndex(0);

      setTimeout(() => {
        navigate('/patient/resultats');
      }, 2000);
    } catch (error) {
      console.error('Erreur soumission:', error);
      setSubmitStatus('error');
    }
  }, [responses, navigate]);

  if (loading) {
    return (
      <>
        <PageMeta
          title="Dépistage | FadakCare - Test de Risque Cardiovasculaire"
          description="Effectuez votre test de dépistage cardiovasculaire"
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des questionnaires...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta
          title="Erreur | FadakCare - Dépistage"
          description="Une erreur s'est produite lors du chargement"
        />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertIcon className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </>
    );
  }

  const currentQuestionnaire = questionnaires[currentIndex];
  const isLastQuestionnaire = currentIndex === questionnaires.length - 1;
  const progressPercentage = questionnaires.length > 0 
    ? Math.round(((currentIndex + 1) / questionnaires.length) * 100) 
    : 0;

  const formatAnswer = (question: Question, value: string | string[] | boolean | undefined): string => {
    if (value === undefined) return '—';
    if (question.type === 'booléen') {
      return value === true || value === 'true' ? 'Oui' : 'Non';
    }
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const allAnswered = questionnaires.every(qnr =>
    qnr.questions.every(q => responses[q.id] !== undefined && responses[q.id] !== '')
  );

  return (
    <>
      <PageMeta
        title="Dépistage | FadakCare - Test de Risque Cardiovasculaire"
        description="Effectuez votre test de dépistage cardiovasculaire"
      />
      <div className="max-w-screen-2xl mx-auto p-6">{/* max-w-6xl -> max-w-screen-2xl */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header unifié */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Test de Risque Cardiovasculaire</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                  Veuillez répondre aux questionnaires ci-dessous. Toutes les questions sont obligatoires pour générer une analyse fiable.
                </p>
              </div>
              {questionnaires.length > 0 && (
                <div className="w-full md:w-96">{/* largeur augmentée */}
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-xs text-gray-500 dark:text-gray-400">Progression</span>
                     <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{progressPercentage}%</span>
                   </div>
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner relative">
                    <progress
                      value={questionnaires.length ? currentIndex + 1 : 0}
                      max={questionnaires.length || 1}
                      aria-label="Progression du questionnaire"
                      className="w-full h-3 appearance-none [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-teal-500 [&::-webkit-progress-value]:to-emerald-500 dark:[&::-webkit-progress-value]:from-teal-400 dark:[&::-webkit-progress-value]:to-emerald-400 [&::-moz-progress-bar]:bg-gradient-to-r [&::-moz-progress-bar]:from-teal-500 [&::-moz-progress-bar]:to-emerald-500"
                    />
                  </div>
                 </div>
               )}
            </div>
          </div>

          <div className="p-6">
            {hasPrefilled && (
              <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/20 px-4 py-3 flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="text-sm text-teal-800 dark:text-teal-200">
                  <p className="font-medium">Réponses pré-remplies</p>
                  <p className="mt-0.5 leading-relaxed">Vos dernières réponses ont été automatiquement récupérées. Vous pouvez les modifier avant de soumettre ce nouveau dépistage.</p>
                </div>
              </div>
            )}
            {questionnaires.length === 0 ? (
              <div className="text-center py-12">
                <AlertIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun questionnaire disponible</h3>
                <p className="text-gray-500 dark:text-gray-400">Il n'y a actuellement aucun questionnaire de dépistage disponible.</p>
              </div>
            ) : (
              <>
                {/* En-tête du questionnaire courant */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{currentQuestionnaire.title}</h2>
                    {currentQuestionnaire.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currentQuestionnaire.description}</p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 rounded-full text-xs font-medium whitespace-nowrap self-start">
                    {currentIndex + 1} / {questionnaires.length}
                  </span>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {currentQuestionnaire.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-6">{/* p-5 -> p-6 */}
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                        {index + 1}. {question.text}
                      </h3>
                      <div className="space-y-3">
                        {question.type === 'texte' && (
                          <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Votre réponse..."
                            value={(responses[question.id] as string) || ''}
                            onChange={(e) => handleChange(question.id, e.target.value)}
                          />
                        )}
                        {question.type === 'numérique' && (
                          <input
                            type="number"
                            min="0"
                            className="w-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0"
                            value={(responses[question.id] as string) || ''}
                            onChange={(e) => handleChange(question.id, e.target.value)}
                          />
                        )}
                        {question.type === 'booléen' && (
                          <div className="flex space-x-4">
                            {['true','false'].map(val => (
                              <label key={val} className="flex items-center cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={val}
                                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                  checked={responses[question.id] === val || responses[question.id] === (val === 'true')}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                />
                                <span className="ml-3 text-gray-700 dark:text-gray-300">{val === 'true' ? 'Oui' : 'Non'}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {question.type === 'choix unique' && (
                          <div className="space-y-2">
                            {(question.options || DEFAULT_OPTIONS['choix unique']).map(option => (
                              <label key={option} className="flex items-center cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option}
                                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                  checked={responses[question.id] === option}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                />
                                <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {question.type === 'select' && (
                          <div className="space-y-2">
                            {(() => {
                              const opts = (question.options || DEFAULT_OPTIONS.select);
                              if (opts.length <= 5) {
                                return (
                                  <div className="space-y-2">
                                    {opts.map(option => (
                                      <label key={option} className="flex items-center cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <input
                                          type="radio"
                                          name={`question-${question.id}`}
                                          value={option}
                                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                          checked={responses[question.id] === option}
                                          onChange={(e) => handleChange(question.id, e.target.value)}
                                        />
                                        <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                );
                              }
                              return (
                                <div className="max-w-sm">
                                  <select
                                    aria-label="Sélectionner une réponse"
                                    title="Sélectionner une réponse"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    value={(responses[question.id] as string) || ''}
                                    onChange={(e) => handleChange(question.id, e.target.value)}
                                  >
                                    <option value="" disabled>Choisissez une option...</option>
                                    {opts.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        {question.type === 'choix multiple' && (
                          <div className="space-y-2">
                            {(question.options || DEFAULT_OPTIONS['choix multiple']).map(option => (
                              <label key={option} className="flex items-center cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                  checked={(responses[question.id] as string[])?.includes(option) || false}
                                  onChange={() => handleCheckbox(question.id, option)}
                                />
                                <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      variant="outline"
                      className="flex items-center"
                      startIcon={<ChevronLeftIcon className="h-4 w-4" />}
                    >
                      Précédent
                    </Button>
                    <div className="flex items-center gap-3">
                      {isLastQuestionnaire && (
                        <Button
                          onClick={() => setShowSummary(prev => !prev)}
                          variant="outline"
                          className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-gray-700"
                        >
                          {showSummary ? 'Masquer le récapitulatif' : 'Voir le récapitulatif'}
                        </Button>
                      )}
                      {isLastQuestionnaire ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={submitStatus === 'loading' || !allAnswered}
                          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                          startIcon={submitStatus === 'loading' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                        >
                          {submitStatus === 'loading' ? 'Envoi en cours...' : 'Soumettre le test'}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center"
                          endIcon={<AngleRightIcon className="h-4 w-4" />}
                        >
                          Suivant
                        </Button>
                      )}
                    </div>
                  </div>
                  {isLastQuestionnaire && showSummary && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4 max-h-80 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Récapitulatif des réponses</h4>
                        {!allAnswered && <span className="text-xs text-red-500">Questions manquantes</span>}
                      </div>
                      <ul className="space-y-3 text-sm">
                        {questionnaires.map((qnr, qIdx) => (
                          <li key={qnr.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-teal-700 dark:text-teal-300">{qIdx + 1}. {qnr.title}</span>
                              {currentIndex !== qIdx && (
                                <button
                                  onClick={() => { setCurrentIndex(qIdx); setShowSummary(false); }}
                                  className="text-xs text-teal-600 hover:underline"
                                >
                                  Modifier
                                </button>
                              )}
                            </div>
                            <ul className="space-y-2">
                              {qnr.questions.map(q => {
                                const val = responses[q.id];
                                return (
                                  <li key={q.id} className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400">•</span>
                                    <div className="flex-1">
                                      <p className="text-gray-700 dark:text-gray-300 font-medium line-clamp-2">{q.text}</p>
                                      <p className="text-gray-600 dark:text-gray-400 italic">{formatAnswer(q, val) || '—'}</p>
                                    </div>
                                    {val === undefined || val === '' || (Array.isArray(val) && val.length === 0) ? (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">Manquant</span>
                                    ) : (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">OK</span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 text-right text-xs text-gray-500 dark:text-gray-400">
                        {allAnswered ? 'Toutes les questions sont complétées.' : 'Veuillez répondre à toutes les questions avant de soumettre.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages de statut */}
                {submitStatus === 'success' && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-green-800 font-medium">Test soumis avec succès !</p>
                      <p className="text-green-600 text-sm">Redirection vers vos résultats...</p>
                    </div>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                    <AlertIcon className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="text-red-800 font-medium">Erreur lors de l'envoi</p>
                      <p className="text-red-600 text-sm">Veuillez réessayer plus tard.</p>
                    </div>
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => navigate('/patient/resultats')}
                    variant="outline"
                    className="text-teal-600 border-teal-600 hover:bg-teal-50"
                    endIcon={<ArrowRightIcon className="h-4 w-4" />}
                  >
                    Voir mes résultats précédents
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
