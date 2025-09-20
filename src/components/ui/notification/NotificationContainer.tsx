import React, { useState, useCallback } from 'react';
import Notification, { NotificationProps } from './Notification';

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

let notificationId = 0;

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = useCallback((notification: NotificationData) => {
    const id = `notification-${++notificationId}`;
    const newNotification: NotificationProps = {
      id,
      ...notification,
      onClose: removeNotification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  // Expose the addNotification function globally
  React.useEffect(() => {
    (window as any).showNotification = addNotification;
  }, [addNotification]);

  return (
    <div className={`fixed z-50 pointer-events-none ${getPositionClasses()}`}>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification {...notification} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions for easier usage
export const showSuccess = (message: string, title?: string, duration?: number) => {
  if ((window as any).showNotification) {
    (window as any).showNotification({ type: 'success', message, title, duration });
  }
};

export const showError = (message: string, title?: string, duration?: number) => {
  if ((window as any).showNotification) {
    (window as any).showNotification({ type: 'error', message, title, duration });
  }
};

export const showWarning = (message: string, title?: string, duration?: number) => {
  if ((window as any).showNotification) {
    (window as any).showNotification({ type: 'warning', message, title, duration });
  }
};

export const showInfo = (message: string, title?: string, duration?: number) => {
  if ((window as any).showNotification) {
    (window as any).showNotification({ type: 'info', message, title, duration });
  }
};

export default NotificationContainer;
