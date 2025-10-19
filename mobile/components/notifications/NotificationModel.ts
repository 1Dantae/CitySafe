export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'incident_report' | 'safety_update';
  timestamp: Date;
  read: boolean;
  location?: string;  // Optional location for location-based notifications
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationSettings {
  enableSafetyAlerts: boolean;
  enableIncidentReports: boolean;
  enableLocationBased: boolean;
  notificationSound: boolean;
  vibration: boolean;
}