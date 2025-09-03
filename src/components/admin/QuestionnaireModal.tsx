import { useModal } from '../../context/ModalContext';
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '../ui/SimpleIcons';

// Type pour les questions en cours d'édition
interface QuestionFormData {
  text: string;
  type: 'texte' | 'numérique' | 'booléen' | 'choix unique' | 'choix multiple' | 'select';
  options: string[];
}

interface QuestionnaireModalProps {
  isOpen: boolean;
  isEdit: boolean;
  title: string;
  questions: QuestionFormData[];
  onClose: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onQuestionTextChange: (index: number, value: string) => void;
  onQuestionTypeChange: (index: number, type: QuestionFormData['type']) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
}

export default function QuestionnaireModal({
  isOpen,
  isEdit,
  title,
  questions,
  onClose,
  onSave,
  onTitleChange,
  onQuestionTextChange,
  onQuestionTypeChange,
  onAddQuestion,
  onRemoveQuestion,
  onAddOption,
  onRemoveOption,
  onOptionChange
}: QuestionnaireModalProps) {
  const { setModalOpen } = useModal();

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  const handleSave = () => {
    onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {isEdit ? 'Modifier le questionnaire' : 'Créer un questionnaire'}
              </h3>
              <p className="text-purple-100 text-sm mt-1">
                {isEdit ? 'Modifiez les informations du questionnaire' : 'Créez un nouveau questionnaire de dépistage'}
              </p>
            </div>
            <button
              onClick={handleClose}
              title="Fermer le modal"
              aria-label="Fermer le modal"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Titre du questionnaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre du questionnaire
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Entrez le titre du questionnaire"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Questions
                </label>
                <button
                  onClick={onAddQuestion}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Ajouter une question
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Question {questionIndex + 1}
                      </h4>
                      {questions.length > 1 && (
                        <button
                          onClick={() => onRemoveQuestion(questionIndex)}
                          title="Supprimer cette question"
                          aria-label="Supprimer cette question"
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Texte de la question */}
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => onQuestionTextChange(questionIndex, e.target.value)}
                        placeholder="Entrez le texte de la question"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />

                      {/* Type de question */}
                      <select
                        value={question.type}
                        onChange={(e) => onQuestionTypeChange(questionIndex, e.target.value as QuestionFormData['type'])}
                        title="Type de question"
                        aria-label="Sélectionner le type de question"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="texte">Texte libre</option>
                        <option value="numérique">Numérique</option>
                        <option value="booléen">Oui/Non</option>
                        <option value="choix unique">Choix unique</option>
                        <option value="choix multiple">Choix multiple</option>
                        <option value="select">Liste déroulante</option>
                      </select>

                      {/* Options pour les questions à choix */}
                      {(question.type === 'choix unique' || question.type === 'choix multiple' || question.type === 'select') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Options
                            </label>
                            <button
                              onClick={() => onAddOption(questionIndex)}
                              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              + Ajouter une option
                            </button>
                          </div>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => onOptionChange(questionIndex, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              {question.options.length > 1 && (
                                <button
                                  onClick={() => onRemoveOption(questionIndex, optionIndex)}
                                  title="Supprimer cette option"
                                  aria-label="Supprimer cette option"
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec boutons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              {isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}