import { useNavigate } from 'react-router-dom';

interface EmptyResultatsStateProps {
  onNewDepistage?: () => void;
}

const EmptyResultatsState = ({ onNewDepistage }: EmptyResultatsStateProps) => {
  const navigate = useNavigate();

  const handleNewDepistage = () => {
    if (onNewDepistage) {
      onNewDepistage();
    } else {
      navigate('/patient/depistage');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-12 h-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucun résultat disponible
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Vous n'avez pas encore effectué de dépistage. Commencez votre évaluation médicale pour recevoir vos premiers résultats.
        </p>

        {/* Action */}
        <button
          onClick={handleNewDepistage}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          Nouveau dépistage
        </button>
      </div>
    </div>
  );
};

export default EmptyResultatsState;
