import { NotificationService } from './NotificationService';

/**
 * Generates safety notifications based on location and incident reports
 */
export class SafetyNotificationHelper {
  /**
   * Generates location-based safety notifications when users query about specific locations
   */
  static async generateLocationSafetyNotification(location: string): Promise<void> {
    try {
      // This would be called from the chat system when a location is discussed
      await NotificationService.generateLocationBasedNotification(location);
    } catch (error) {
      console.error('Error generating location safety notification:', error);
    }
  }

  /**
   * Generates safety alerts based on recent incident reports in an area
   */
  static async generateIncidentBasedAlert(location: string, incidentType: string): Promise<void> {
    try {
      await NotificationService.generateLocationBasedNotification(location, incidentType);
    } catch (error) {
      console.error('Error generating incident-based safety alert:', error);
    }
  }

  /**
   * Creates a general safety alert notification
   */
  static async createGeneralSafetyAlert(message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    try {
      await NotificationService.generateSafetyAlert(message, priority);
    } catch (error) {
      console.error('Error creating general safety alert:', error);
    }
  }
}