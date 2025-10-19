import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Notification, NotificationSettings } from '../components/notifications/NotificationModel';
import { NotificationService } from '../services/NotificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  loading: boolean;
}

interface NotificationContextType extends NotificationState {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    enableSafetyAlerts: true,
    enableIncidentReports: true,
    enableLocationBased: true,
    notificationSound: true,
    vibration: true,
  },
  loading: true,
};

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; read: boolean } }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_SETTINGS'; payload: NotificationSettings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_UNREAD_COUNT' };

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      const unreadCount = action.payload.filter(n => !n.read).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
        loading: false,
      };
    case 'ADD_NOTIFICATION':
      const newUnreadCount = state.unreadCount + (action.payload.read ? 0 : 1);
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: newUnreadCount,
      };
    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.id
          ? { ...notification, read: action.payload.read }
          : notification
      );
      const updatedUnreadCount = updatedNotifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedUnreadCount,
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0,
      };
    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      const filteredUnreadCount = filteredNotifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredUnreadCount,
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Fetch notifications and settings when component mounts
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load notifications
      const notifications = await NotificationService.getNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      
      // Load settings
      const settings = await NotificationService.getSettings();
      dispatch({ type: 'SET_SETTINGS', payload: settings });
    } catch (error) {
      console.error('Error initializing notifications:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchNotifications = async () => {
    try {
      const notifications = await NotificationService.getNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, read: true } });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await NotificationService.clearAllNotifications();
      dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const updateSettings = async (settings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = await NotificationService.updateSettings(settings);
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notifications = await NotificationService.getNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};