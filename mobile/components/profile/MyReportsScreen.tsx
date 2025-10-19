import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native';
import type { TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useUserProfile } from './UserProfileContext';

// Scaling function based on screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is the base width for iPhone
const verticalScale = SCREEN_HEIGHT / 812; // 812 is the base height for iPhone X

const scaleSize = (size: number) => Math.ceil(size * scale);
const scaleVertical = (size: number) => Math.ceil(size * verticalScale);

interface MyReportsScreenProps {
  onBack: () => void;
}

const MyReportsScreen: React.FC<MyReportsScreenProps> = ({ onBack }) => {
  const { reports, user, fetchMyReports } = useUserProfile();

  useEffect(() => {
    if (user?.id) fetchMyReports(user.id);
    else fetchMyReports();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptySubtitle}>Your submitted reports will appear here</Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {reports.map((report) => (
              <TouchableOpacity key={report.id} style={styles.reportItem}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  {report.status === 'resolved' ? (
                    <Text style={styles.reportStatusResolved}>Resolved</Text>
                  ) : report.status === 'in-progress' ? (
                    <Text style={styles.reportStatusInProgress}>In Progress</Text>
                  ) : (
                    <Text style={styles.reportStatusPending}>Pending</Text>
                  )}
                </View>
                <Text style={styles.reportDate}>{report.date}</Text>
                {/** Show image if backend provided media_url */}
                {report.media_url ? (
                  <Image source={{ uri: report.media_url }} style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 8 }} />
                ) : null}
                <Text style={styles.reportDescription}>{report.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
type Styles = {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  headerTitle: TextStyle;
  headerRight: ViewStyle;
  content: ViewStyle;
  emptyContainer: ViewStyle;
  emptyTitle: TextStyle;
  emptySubtitle: TextStyle;
  reportsList: ViewStyle;
  reportItem: ViewStyle;
  reportHeader: ViewStyle;
  reportTitle: TextStyle;
  reportStatusResolved: TextStyle;
  reportStatusInProgress: TextStyle;
  reportStatusPending: TextStyle;
  reportDetails: ViewStyle;
  detailLabel: TextStyle;
  detailText: TextStyle;
  reportDate: TextStyle;
  reportDescription: TextStyle;
  mediaPreviewContainer: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: scaleVertical(60),
    paddingBottom: scaleVertical(24),
    paddingHorizontal: scaleSize(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: scaleSize(4),
  },
  headerTitle: {
    fontSize: scaleSize(20),
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerRight: {
    width: scaleSize(24), // Spacer for alignment
  },
  content: {
    flex: 1,
    paddingHorizontal: scaleSize(24),
    paddingTop: scaleVertical(24),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scaleVertical(60),
  },
  emptyTitle: {
    fontSize: scaleSize(20),
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: scaleVertical(16),
    marginBottom: scaleVertical(8),
  },
  emptySubtitle: {
    fontSize: scaleSize(16),
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: scaleSize(24),
  },
  reportsList: {
    marginBottom: scaleVertical(24),
  },
  reportItem: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(16),
    padding: scaleSize(20),
    marginBottom: scaleVertical(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleVertical(12),
  },
  reportTitle: {
    fontSize: scaleSize(18),
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 0.7,
  },
  reportStatusResolved: {
    fontSize: scaleSize(14),
    color: '#22c55e',
    fontWeight: '600',
    backgroundColor: '#dcfce7',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleVertical(4),
    borderRadius: scaleSize(12),
  },
  reportStatusInProgress: {
    fontSize: scaleSize(14),
    color: '#3b82f6',
    fontWeight: '600',
    backgroundColor: '#dbeafe',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleVertical(4),
    borderRadius: scaleSize(12),
  },
  reportStatusPending: {
    fontSize: scaleSize(14),
    color: '#f59e0b',
    fontWeight: '600',
    backgroundColor: '#fef3c7',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleVertical(4),
    borderRadius: scaleSize(12),
  },
  reportDetails: {
    flexDirection: 'row',
    marginBottom: scaleVertical(8),
  },
  detailLabel: {
    fontWeight: 'bold',
    color: Colors.primary,
    minWidth: scaleSize(80),
  },
  detailText: {
    flex: 1,
    color: Colors.gray,
  },
  reportDate: {
    fontSize: scaleSize(16),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: scaleVertical(12),
  },
  reportDescription: {
    fontSize: scaleSize(16),
    color: Colors.gray,
    lineHeight: scaleSize(22),
  },
  mediaPreviewContainer: {
    marginBottom: scaleVertical(12),
  },
});

export default MyReportsScreen;