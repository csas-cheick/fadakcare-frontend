import { useNavigate } from 'react-router-dom';

const EmptyMedecinState = () => {
  const navigate = useNavigate();

  const handleContactAdmin = () => {
    navigate('/patient/messagerie');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-8 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun médecin assigné
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Aucun médecin n'est actuellement assigné à votre dossier.
        </p>
        <button 
          onClick={handleContactAdmin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Contacter l'administration
        </button>
      </div>
    </div>
  );
};

export default EmptyMedecinState;
