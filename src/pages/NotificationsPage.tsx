import React, { useEffect, useState, useCallback } from 'react';
import { notificationService, NotificationItem } from '../services/notificationService';
import PageMeta from '../components/common/PageMeta';
import Button from '../components/ui/button/Button';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const userId = localStorage.getItem('userId');

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await notificationService.listByUser(Number(userId), 50); // Charger plus de notifications
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notifId: number) => {
    if (!userId) return;
    try {
      await notificationService.markOneRead(Number(userId), notifId);
      setNotifications(prev => 
        prev.map(n => n.id === notifId ? { ...n, lu: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationService.markAllRead(Number(userId));
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.lu;
    if (filter === 'read') return notif.lu;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.lu).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alerte':
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full dark:bg-red-900/30">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'rendez-vous':
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-900/30">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <>
      <PageMeta 
        title="Notifications" 
        description="Gérez vos notifications et alertes" 
      />
      <div className="bg-white rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gérez vos notifications et alertes
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="text-sm"
              >
                Marquer toutes comme lues ({unreadCount})
              </Button>
            )}
          </div>

          {/* Filtres */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'read'
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Lues ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4 19h11a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === 'unread' && 'Aucune notification non lue'}
                {filter === 'read' && 'Aucune notification lue'}
                {filter === 'all' && 'Aucune notification'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? 'Toutes vos notifications apparaîtront ici.'
                  : 'Changez le filtre pour voir d\'autres notifications.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                    !notif.lu 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  onClick={() => !notif.lu && markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      {getTypeIcon(notif.type)}
                      {!notif.lu && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-400 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {notif.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {notif.timeAgo}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                        {notif.message}
                      </p>

                      {!notif.lu && (
                        <div className="mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                          >
                            Marquer comme lue
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
