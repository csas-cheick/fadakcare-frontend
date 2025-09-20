import { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link, useNavigate } from "react-router-dom";
import { notificationService, NotificationItem } from "../../services/notificationService";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get current user info from localStorage
  const userId = localStorage.getItem('userId');

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      console.log('No userId found in localStorage');
      return;
    }
    try {
      console.log('Loading notifications for userId:', userId);
      setLoading(true);
      const data = await notificationService.listByUser(Number(userId), 8);
      console.log('Notifications loaded:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) {
      console.log('No userId found for unread count');
      return;
    }
    try {
      console.log('Loading unread count for userId:', userId);
      const count = await notificationService.unreadCount(Number(userId));
      console.log('Unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [userId, loadNotifications, loadUnreadCount]);

  const markAsRead = async (notifId: number) => {
    if (!userId) return;
    try {
      await notificationService.markOneRead(Number(userId), notifId);
      await loadUnreadCount();
      // Update local state
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
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Fonction pour afficher le message de notification de manière appropriée
  const getNotificationMessage = (notif: NotificationItem) => {
    // Pour tous les types, le backend génère maintenant des messages appropriés
    // Plus besoin de traitement spécial côté frontend
    return notif.message;
  };

  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = (notif: NotificationItem) => {
    // Marquer comme lue
    if (!notif.lu) markAsRead(notif.id);
    
    // Rediriger vers la page appropriée selon le type
    if (notif.type === 'alerte') {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'patient') {
        navigate('/patient/alerte');
      } else if (userRole === 'medecin') {
        navigate('/medecin/alerte');
      } else {
        navigate('/admin/alertes');
      }
    } else if (notif.type === 'rendez-vous') {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'patient') {
        navigate('/patient/rendez-vous');
      } else if (userRole === 'medecin') {
        navigate('/medecin/rendez-vous');
      } else {
        navigate('/admin/rendez-vous');
      }
    } else {
      // Pour autres types, aller vers la page générale des notifications
      navigate('/notifications');
    }
    
    closeDropdown();
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };
  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
        aria-label="Ouvrir les notifications"
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0 w-[350px] h-[480px]"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium text-white bg-orange-400 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                title="Marquer toutes comme lues"
              >
                Tout marquer lu
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Fermer les notifications"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        
        <ul className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <li className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
              <span className="ml-3 text-gray-500">Chargement des notifications...</span>
            </li>
          ) : notifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center flex-1 p-6 text-center">
              <div className="mb-3">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4 19h11a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                Aucune notification
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Vous êtes à jour ! Toutes vos notifications apparaîtront ici.
              </p>
            </li>
          ) : (
            notifications.map((notif) => (
              <li key={notif.id}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notif)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer ${
                    !notif.lu ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                    {notif.type === 'alerte' ? (
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full dark:bg-red-900/30">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : notif.type === 'rendez-vous' ? (
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900/30">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : notif.type === 'message' ? (
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-700">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {!notif.lu && (
                      <span className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-orange-400 dark:border-gray-900"></span>
                    )}
                  </span>

                  <span className="block">
                    <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                      {getNotificationMessage(notif)}
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span className="capitalize">{notif.type}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{notif.timeAgo}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
        {notifications.length > 0 && (
          <Link
            to="/notifications"
            onClick={closeDropdown}
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Voir toutes les notifications ({notifications.length > 8 ? '8+' : notifications.length})
          </Link>
        )}
      </Dropdown>
    </div>
  );
}
