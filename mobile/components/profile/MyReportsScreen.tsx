import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
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
  const { reports } = useUserProfile();

  const isVideoFile = (uri: string): boolean => {
    const videoExtensions = ['.mov', '.mp4', '.avi', '.webm', '.wmv', '.flv', '.f4v', '.f4p', '.f4a', '.f4b'];
    return videoExtensions.some(ext => uri.toLowerCase().endsWith(ext));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
                <Text style={styles.reportDate}>{report.date} at {report.time || 'N/A'}</Text>
                <View style={styles.reportDetails}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailText}>{report.time || 'N/A'}</Text>
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailText}>{report.location}</Text>
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailText}>{report.incidentType}</Text>
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.detailLabel}>Witnesses:</Text>
                  <Text style={styles.detailText}>{report.witnesses || 'N/A'}</Text>
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.detailLabel}>Anonymous:</Text>
                  <Text style={styles.detailText}>{report.anonymous ? 'Yes' : 'No'}</Text>
                </View>
                {!report.anonymous && (
                  <>
                    <View style={styles.reportDetails}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailText}>{report.name || 'N/A'}</Text>
                    </View>
                    <View style={styles.reportDetails}>
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailText}>{report.phone || 'N/A'}</Text>
                    </View>
                    <View style={styles.reportDetails}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailText}>{report.email || 'N/A'}</Text>
                    </View>
                  </>
                )}
                {report.mediaUri && (
                  <View style={styles.mediaPreviewContainer}>
                    {isVideoFile(report.mediaUri) ? (
                      <Video
                        source={{ uri: report.mediaUri }}
                        style={styles.mediaPreview}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping={false}
                      />
                    ) : (
                      <Image source={{ uri: report.mediaUri }} style={styles.mediaPreview} />
                    )}
                  </View>
                )}
                <View style={styles.reportDetails}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailText}>{report.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  mediaPreviewContainer: {
    marginBottom: scaleVertical(12),
  },
  mediaPreview: {
    width: '100%',
    height: scaleVertical(150),
    borderRadius: scaleSize(8),
  },
});

export default MyReportsScreen;