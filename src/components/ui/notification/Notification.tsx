import React, { useEffect } from 'react';
import { CheckCircleIcon, ErrorIcon, AlertIcon, InfoIcon, CloseIcon } from "../../../icons";

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'error':
        return <ErrorIcon className="w-5 h-5" />;
      case 'warning':
        return <AlertIcon className="w-5 h-5" />;
      case 'info':
        return <InfoIcon className="w-5 h-5" />;
      default:
        return <InfoIcon className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800 dark:bg-success-500/10 dark:border-success-500/30 dark:text-success-400';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-800 dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-500/10 dark:border-warning-500/30 dark:text-warning-400';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-500/10 dark:border-gray-500/30 dark:text-gray-400';
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getColorClasses()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h4 className="text-sm font-medium mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onClose(id)}
            className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
