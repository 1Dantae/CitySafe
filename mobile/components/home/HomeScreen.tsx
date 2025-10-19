import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import MapView from './MapView';
import { useNotification } from '../notifications/NotificationContext';

// Scaling function based on screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is the base width for iPhone
const verticalScale = SCREEN_HEIGHT / 812; // 812 is the base height for iPhone X

const scaleSize = (size: number) => Math.ceil(size * scale);
const scaleVertical = (size: number) => Math.ceil(size * verticalScale);

interface HomeScreenProps {
  userType: 'anonymous' | 'user' | null;
  onReport: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onMyReports: () => void;
  onChat: () => void;
  onNotifications: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  userType,
  onReport,
  onLogout,
  onProfile,
  onMyReports,
  onChat,
  onNotifications,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount } = useNotification();

  const handleEmergencyCall = () => {
    Linking.openURL('tel:911');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SafeCity</Text>
          <Text style={styles.headerSubtitle}>
            {userType === 'anonymous' ? 'Guest Mode' : 'Registered User'}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={onNotifications}>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <Ionicons name="menu" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView userType={userType} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.reportButton, styles.halfButton]} onPress={onReport}>
              <Ionicons name="document-text" size={24} color={Colors.white} />
              <Text style={styles.reportButtonText}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chatButton, styles.halfButton]} onPress={onChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.white} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergencyCall}
          >
            <Ionicons name="call" size={24} color={Colors.white} />
            <Text style={styles.emergencyButtonText}>Emergency Call 911</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onProfile();
                }}
              >
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onMyReports();
                }}
              >
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                <Text style={styles.menuItemText}>My Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onNotifications();
                }}
              >
                <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                <Text style={styles.menuItemText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={Colors.emergency} />
                <Text style={[styles.menuItemText, { color: Colors.emergency }]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingTop: scaleVertical(30),
    paddingBottom: scaleVertical(16),
    paddingHorizontal: scaleSize(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  headerTitle: {
    fontSize: scaleSize(24),
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: scaleSize(12),
    color: Colors.white,
    opacity: 0.75,
    marginTop: scaleVertical(2),
  },
  headerIcons: {
    flexDirection: 'row',
    gap: scaleSize(16),
  },
  iconButton: {
    padding: scaleSize(4),
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    margin: scaleSize(16),
    marginTop: scaleVertical(8),
  },
  actionButtons: {
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleVertical(16),
    marginTop: scaleVertical(8),
  },
  reportButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleVertical(18),
    borderRadius: scaleSize(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  reportButtonText: {
    color: Colors.white,
    fontSize: scaleSize(16),
    fontWeight: '600',
    marginLeft: scaleSize(12),
  },
  emergencyButton: {
    backgroundColor: Colors.emergency,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleVertical(18),
    borderRadius: scaleSize(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  emergencyButtonText: {
    color: Colors.white,
    fontSize: scaleSize(16),
    fontWeight: '600',
    marginLeft: scaleSize(12),
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: scaleSize(280),
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: -scaleSize(2), height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleSize(24),
    paddingTop: scaleVertical(60),
    paddingBottom: scaleVertical(24),
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  menuTitle: {
    fontSize: scaleSize(24),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  menuItems: {
    paddingTop: scaleVertical(16),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleVertical(16),
  },
  menuItemText: {
    fontSize: scaleSize(16),
    color: Colors.primary,
    marginLeft: scaleSize(12),
  },
  chatButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleVertical(18),
    borderRadius: scaleSize(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  chatButtonText: {
    color: Colors.white,
    fontSize: scaleSize(16),
    fontWeight: '600',
    marginLeft: scaleSize(12),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleVertical(24),
  },
  halfButton: {
    flex: 1,
    marginHorizontal: scaleSize(4),
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.emergency,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: scaleSize(10),
    fontWeight: 'bold',
  },
});

export default HomeScreen;