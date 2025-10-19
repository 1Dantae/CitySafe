import { Notification, NotificationSettings } from '../components/notifications/NotificationModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@citysafe_notifications';
const SETTINGS_KEY = '@citysafe_notification_settings';

export class NotificationService {
  // Default notification settings
  private static defaultSettings: NotificationSettings = {
    enableSafetyAlerts: true,
    enableIncidentReports: true,
    enableLocationBased: true,
    notificationSound: true,
    vibration: true,
  };

  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    // Save to AsyncStorage
    const existingNotifications = await this.getNotifications();
    const updatedNotifications = [newNotification, ...existingNotifications];
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    
    return newNotification;
  }

  // Get all notifications
  static async getNotifications(): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        // Ensure date objects are properly converted
        return notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Get unread notifications
  static async getUnreadNotifications(): Promise<Notification[]> {
    const allNotifications = await this.getNotifications();
    return allNotifications.filter(notification => !notification.read);
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<void> {
    const notifications = await this.getNotifications();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const updatedNotifications = notifications.filter(notification => 
      notification.id !== notificationId
    );
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  }

  // Clear all notifications
  static async clearAllNotifications(): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  }

  // Get notification settings
  static async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return this.defaultSettings;
    }
  }

  // Update notification settings
  static async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  }

  // Generate location-based safety notifications
  static async generateLocationBasedNotification(location: string, incidentType?: string): Promise<Notification | null> {
    const settings = await this.getSettings();
    
    if (!settings.enableLocationBased) {
      return null;
    }

    let title, message, type;
    
    if (incidentType) {
      title = `Incident Reported Near ${location}`;
      message = `A ${incidentType} incident was recently reported in your area. Please exercise caution.`;
      type = 'incident_report';
    } else {
      title = `Safety Alert for ${location}`;
      message = `Safety conditions in ${location} may require your attention. Please stay alert and follow safety guidelines.`;
      type = 'warning';
    }

    return this.createNotification({
      title,
      message,
      type,
      priority: 'medium',
      location,
    });
  }

  // Generate safety alerts
  static async generateSafetyAlert(message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<Notification> {
    const settings = await this.getSettings();
    
    if (!settings.enableSafetyAlerts) {
      // Return a notification object without saving if disabled
      return {
        id: Date.now().toString(),
        title: 'Safety Alert',
        message,
        type: 'alert',
        timestamp: new Date(),
        read: false,
        priority,
      };
    }

    return this.createNotification({
      title: 'Safety Alert',
      message,
      type: 'alert',
      priority,
    });
  }

  // Generate incident report notifications
  static async generateIncidentReportNotification(reportTitle: string, location: string): Promise<Notification | null> {
    const settings = await this.getSettings();
    
    if (!settings.enableIncidentReports) {
      return null;
    }

    return this.createNotification({
      title: 'New Incident Report',
      message: `A new incident report titled "${reportTitle}" has been filed for ${location}.`,
      type: 'incident_report',
      priority: 'medium',
      location,
    });
  }

  // Clean up old notifications (older than 30 days)
  static async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const notifications = await this.getNotifications();
    const recentNotifications = notifications.filter(
      notification => notification.timestamp > thirtyDaysAgo
    );
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(recentNotifications));
  }
}