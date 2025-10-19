import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNotification } from './NotificationContext';
import { Notification } from './NotificationModel';

// Scaling function based on screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is the base width for iPhone
const verticalScale = SCREEN_HEIGHT / 812; // 812 is the base height for iPhone X

const scaleSize = (size: number) => Math.ceil(size * scale);
const scaleVertical = (size: number) => Math.ceil(size * verticalScale);

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  // Determine icon based on notification type
  let icon = 'information-circle-outline';
  let color = Colors.primary;

  switch (notification.type) {
    case 'alert':
      icon = 'alert-circle-outline';
      color = Colors.danger || Colors.emergency;
      break;
    case 'incident_report':
      icon = 'warning-outline';
      color = Colors.warning || Colors.emergency;
      break;
    case 'safety_update':
      icon = 'shield-checkmark-outline';
      color = Colors.success || Colors.primary;
      break;
    case 'warning':
      icon = 'warning-outline';
      color = Colors.warning || Colors.emergency;
      break;
    case 'info':
    default:
      icon = 'information-circle-outline';
      color = Colors.primary;
  }

  // Determine priority styling
  const priorityStyle = {
    borderLeftWidth: notification.priority === 'high' ? 4 : 
                     notification.priority === 'medium' ? 3 : 1,
    borderLeftColor: notification.priority === 'high' ? (Colors.danger || Colors.emergency) : 
                     notification.priority === 'medium' ? (Colors.warning || Colors.emergencyDark) : 
                     Colors.primary,
  };

  return (
    <View style={[styles.notificationItem, priorityStyle, !notification.read && styles.unreadItem]}>
      <View style={styles.notificationHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={[styles.notificationTitle, !notification.read && styles.unreadText]}>
            {notification.title}
          </Text>
        </View>
        <Text style={styles.notificationTime}>
          {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      <Text style={[styles.notificationMessage, !notification.read && styles.unreadText]}>
        {notification.message}
      </Text>
      
      {notification.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={Colors.textLight} />
          <Text style={styles.locationText}>{notification.location}</Text>
        </View>
      )}
      
      <View style={styles.notificationActions}>
        {!notification.read && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onMarkAsRead(notification.id)}
          >
            <Ionicons name="checkmark-done-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionText}>Mark Read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onDelete(notification.id)}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.emergency} />
          <Text style={[styles.actionText, { color: Colors.emergency }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface NotificationScreenProps {
  onBack: () => void;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
  } = useNotification();

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark All Read', 
          style: 'destructive',
          onPress: () => markAllAsRead() 
        },
      ]
    );
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => clearAllNotifications() 
        },
      ]
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onMarkAsRead={markAsRead}
      onDelete={deleteNotification}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Ionicons name="checkmark-done-circle-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications Count */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{notifications.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.danger || Colors.emergency }]}>
            {unreadCount}
          </Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshNotifications}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        }
      />

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.clearButton]} 
            onPress={handleClearAllNotifications}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.white} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: scaleVertical(60),
    paddingBottom: scaleVertical(16),
    paddingHorizontal: scaleSize(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: scaleSize(18),
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerRight: {
    width: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: scaleSize(16),
    backgroundColor: Colors.white,
    margin: scaleSize(16),
    borderRadius: scaleSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: scaleSize(24),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: scaleSize(12),
    color: Colors.textLight,
    marginTop: scaleVertical(4),
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContainer: {
    padding: scaleSize(16),
  },
  notificationItem: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleVertical(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(1) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(2),
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scaleVertical(8),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitle: {
    fontSize: scaleSize(16),
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: scaleSize(8),
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: scaleSize(12),
    color: Colors.textLight,
  },
  notificationMessage: {
    fontSize: scaleSize(14),
    color: Colors.text,
    lineHeight: scaleVertical(20),
    marginBottom: scaleVertical(8),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleVertical(8),
  },
  locationText: {
    fontSize: scaleSize(12),
    color: Colors.textLight,
    marginLeft: scaleSize(4),
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scaleSize(16),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleVertical(4),
    paddingHorizontal: scaleSize(8),
  },
  actionText: {
    fontSize: scaleSize(12),
    color: Colors.primary,
    marginLeft: scaleSize(4),
  },
  clearButton: {
    backgroundColor: Colors.emergency,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(24),
    paddingVertical: scaleVertical(10),
    paddingHorizontal: scaleSize(20),
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: scaleSize(14),
    fontWeight: '500',
    marginLeft: scaleSize(8),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scaleVertical(60),
  },
  emptyTitle: {
    fontSize: scaleSize(18),
    fontWeight: '600',
    color: Colors.primary,
    marginTop: scaleVertical(16),
  },
  emptySubtitle: {
    fontSize: scaleSize(14),
    color: Colors.textLight,
    marginTop: scaleVertical(8),
    textAlign: 'center',
  },
  actionButtons: {
    padding: scaleSize(16),
    alignItems: 'center',
  },
});

export default NotificationScreen;