import { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchQuestionnaires,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
} from "../../services/depistageService";
import PageMeta from "../../components/common/PageMeta";
import StatCard from "../../components/common/StatCard";
import { Question, Questionnaire } from "../../types";
import { useModal } from "../../context/ModalContext";
import QuestionnaireModal from "../../components/admin/QuestionnaireModal";
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ListBulletIcon,
  HashtagIcon
} from '../../components/ui/SimpleIcons';

// Type pour les questions en cours d'édition (aligné sur Question.type)
interface QuestionFormData {
  text: string;
  type: 'texte' | 'numérique' | 'booléen' | 'choix unique' | 'choix multiple' | 'select'; // ajout 'select'
  options: string[];
}

export default function DepistageAdminPage() {
  const { setModalOpen } = useModal();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQuestions, setNewQuestions] = useState<QuestionFormData[]>([{ 
    text: "", 
    type: "texte", 
    options: [] 
  }]);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestionnaires = async () => {
      try {
        setLoading(true);
        const data = await fetchQuestionnaires();
        setQuestionnaires(data);
      } catch (error) {
        toast.error("Erreur lors du chargement des questionnaires");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadQuestionnaires();
  }, []);

  const resetForm = () => {
    setNewTitle("");
    setNewQuestions([{ text: "", type: "texte", options: [] }]);
    setEditId(null);
  };

  // Fonctions pour gérer les modaux avec ModalContext
  const openCreateModal = () => {
    setOpenDialog(true);
    setModalOpen(true);
  };

  const closeCreateModal = () => {
    setOpenDialog(false);
    setModalOpen(false);
    resetForm();
  };

  const openEditModal = (questionnaire: Questionnaire) => {
    setEditId(questionnaire.id);
    setNewTitle(questionnaire.title);
    
    const formQuestions: QuestionFormData[] = questionnaire.questions.map(q => ({
      text: q.text,
      type: q.type,
      options: q.options || []
    }));
    setNewQuestions(formQuestions);
    
    setEditDialog(true);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setEditDialog(false);
    setModalOpen(false);
    resetForm();
  };

  // Conversion pour l'API
  const convertQuestionsForAPI = (questions: QuestionFormData[]): Question[] => {
    return questions.map((q, index) => ({
      id: index + 1,
      // map 'select' vers 'choix multiple' pour respecter le type backend
      text: q.text,
      type: (q.type === 'select' ? 'choix multiple' : q.type) as Question['type'],
      options: (q.type === 'choix unique' || q.type === 'choix multiple' || q.type === 'select') ? q.options : undefined,
      questionnaireId: 0
    }));
  };

  const handleAddQuestionnaire = async () => {
    if (newTitle.trim() === "" || newQuestions.some((q) => q.text.trim() === "")) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Validation des questions avec options
    const invalidOptionQuestions = newQuestions.filter(q => 
      (q.type === 'choix unique' || q.type === 'choix multiple' || q.type === 'select') && (!q.options || q.options.length === 0)
    );
    if (invalidOptionQuestions.length > 0) {
      toast.error("Les questions à choix doivent avoir au moins une option");
      return;
    }

    try {
      const apiQuestions = convertQuestionsForAPI(newQuestions);
      await createQuestionnaire(newTitle, apiQuestions);
      
      // Recharger la liste complète des questionnaires
      const updatedQuestionnaires = await fetchQuestionnaires();
      setQuestionnaires(updatedQuestionnaires);
      
      toast.success("Questionnaire ajouté avec succès !");
      closeCreateModal();
    } catch (error) {
      toast.error("Erreur lors de la création du questionnaire");
      console.error(error);
    }
  };

  const handleDeleteQuestionnaire = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce questionnaire ?")) return;
    try {
      await deleteQuestionnaire(id);
      setQuestionnaires(questionnaires.filter((q) => q.id !== id));
      toast.success("Questionnaire supprimé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la suppression du questionnaire");
      console.error(error);
    }
  };

  const handleUpdateQuestionnaire = async () => {
    if (newTitle.trim() === "" || newQuestions.some((q) => q.text.trim() === "")) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    const invalidOptionQuestions = newQuestions.filter(q => 
      (q.type === 'choix unique' || q.type === 'choix multiple' || q.type === 'select') && (!q.options || q.options.length === 0)
    );
    if (invalidOptionQuestions.length > 0) {
      toast.error("Les questions à choix doivent avoir au moins une option");
      return;
    }
    try {
      const apiQuestions = convertQuestionsForAPI(newQuestions);
      await updateQuestionnaire(editId!, newTitle, apiQuestions);
      
      // Recharger la liste complète des questionnaires
      const updatedQuestionnaires = await fetchQuestionnaires();
      setQuestionnaires(updatedQuestionnaires);
      
      toast.success("Questionnaire modifié avec succès !");
      closeEditModal();
    } catch (error) {
      toast.error("Erreur lors de la modification du questionnaire");
      console.error(error);
    }
  };

  const handleQuestionTextChange = (index: number, value: string) => {
    const updated = [...newQuestions];
    updated[index].text = value;
    setNewQuestions(updated);
  };

  const handleQuestionTypeChange = (index: number, value: QuestionFormData['type']) => {
    const updated = [...newQuestions];
    updated[index].type = value;
    if (value !== 'choix unique' && value !== 'choix multiple' && value !== 'select') {
      updated[index].options = [];
    } else if (updated[index].options.length === 0) {
      updated[index].options = [''];
    }
    setNewQuestions(updated);
  };

  const handleOptionsChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...newQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setNewQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...newQuestions];
    updated[questionIndex].options.push('');
    setNewQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...newQuestions];
    if (updated[questionIndex].options.length > 1) {
      updated[questionIndex].options.splice(optionIndex, 1);
      setNewQuestions(updated);
    }
  };

  const addQuestion = () => {
    setNewQuestions([...newQuestions, { text: "", type: "texte", options: [] }]);
  };

  const removeQuestion = (index: number) => {
    if (newQuestions.length > 1) {
      setNewQuestions(newQuestions.filter((_, i) => i !== index));
    }
  };

  const filteredQuestionnaires = questionnaires.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'texte': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'numérique': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'booléen': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'choix unique':
      case 'choix multiple':
      case 'select': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'texte': return <DocumentTextIcon className="w-4 h-4" />;
      case 'numérique': return <HashtagIcon className="w-4 h-4" />;
      case 'booléen': return <QuestionMarkCircleIcon className="w-4 h-4" />;
      case 'choix unique':
      case 'choix multiple':
      case 'select': return <ListBulletIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'texte': return 'Texte';
      case 'numérique': return 'Numérique';
      case 'booléen': return 'Oui/Non';
      case 'choix unique': return 'Choix unique';
      case 'choix multiple': return 'Choix multiple';
      case 'select': return 'Sélection';
      default: return type;
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = questionnaires.length;
    const totalQuestions = questionnaires.reduce((acc, q) => acc + q.questions.length, 0);
    const avg = total ? Math.round(totalQuestions / total) : 0;
    return { total, totalQuestions, avg };
  }, [questionnaires]);

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      <PageMeta title="Gestion des Questionnaires | Admin" description="Gestion administrative des questionnaires de dépistage" />
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des Questionnaires</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Créez et gérez vos questionnaires de dépistage multi-types.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <button onClick={openCreateModal} className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              Nouveau
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Questionnaires" value={stats.total} icon={<DocumentTextIcon className="w-5 h-5" />} color="blue" />
            <StatCard title="Questions Totales" value={stats.totalQuestions} icon={<ListBulletIcon className="w-5 h-5" />} color="purple" />
            <StatCard title="Moy. Questions" value={stats.avg} icon={<QuestionMarkCircleIcon className="w-5 h-5" />} color="yellow" />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-6 py-6">
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          )}

            {!loading && filteredQuestionnaires.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredQuestionnaires.map((q) => (
                  <div key={q.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500 transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">{q.title}</h3>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          aria-label="Éditer le questionnaire"
                          title="Éditer"
                          onClick={() => openEditModal(q)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Supprimer le questionnaire"
                          title="Supprimer"
                          onClick={() => handleDeleteQuestionnaire(q.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400"><DocumentTextIcon className="w-4 h-4 mr-2" />{q.questions.length} question{q.questions.length > 1 ? 's' : ''}</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {q.questions.map((question, index) => (
                          <div key={index} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-800 dark:text-white font-medium truncate">{index + 1}. {question.text}</p>
                              {question.type === 'choix unique' && question.options && question.options.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Options:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {question.options.slice(0, 3).map((option, optIndex) => (
                                      <span key={optIndex} className="inline-block px-2 py-0.5 text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">{option}</span>
                                    ))}
                                    {question.options.length > 3 && (
                                      <span className="inline-block px-2 py-0.5 text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">+{question.options.length - 3}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${getQuestionTypeColor(question.type)}`}>{getQuestionTypeIcon(question.type)}<span className="ml-1">{getTypeDisplayName(question.type)}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredQuestionnaires.length === 0 && (
              <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{searchTerm ? 'Aucun questionnaire trouvé' : 'Aucun questionnaire créé'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{searchTerm ? 'Essayez de modifier votre terme de recherche.' : 'Commencez par créer votre premier questionnaire de dépistage.'}</p>
                {!searchTerm && (
                  <button onClick={openCreateModal} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"><PlusIcon className="w-5 h-5 mr-2" />Créer un questionnaire</button>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Modaux */}
      <QuestionnaireModal
        isOpen={openDialog}
        isEdit={false}
        title={newTitle}
        questions={newQuestions}
        onClose={closeCreateModal}
        onSave={handleAddQuestionnaire}
        onTitleChange={setNewTitle}
        onQuestionTextChange={handleQuestionTextChange}
        onQuestionTypeChange={handleQuestionTypeChange}
        onAddQuestion={addQuestion}
        onRemoveQuestion={removeQuestion}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onOptionChange={handleOptionsChange}
      />

      <QuestionnaireModal
        isOpen={editDialog}
        isEdit={true}
        title={newTitle}
        questions={newQuestions}
        onClose={closeEditModal}
        onSave={handleUpdateQuestionnaire}
        onTitleChange={setNewTitle}
        onQuestionTextChange={handleQuestionTextChange}
        onQuestionTypeChange={handleQuestionTypeChange}
        onAddQuestion={addQuestion}
        onRemoveQuestion={removeQuestion}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onOptionChange={handleOptionsChange}
      />

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar 
        style={{ zIndex: 100000 }}
      />
    </div>
  );
}
