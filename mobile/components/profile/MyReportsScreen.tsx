import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useUserProfile } from './UserProfileContext';

interface MyReportsScreenProps {
  onBack: () => void;
}

const MyReportsScreen: React.FC<MyReportsScreenProps> = ({ onBack }) => {
  const { reports, user, fetchMyReports } = useUserProfile();

  useEffect(() => {
    if (user?.id) fetchMyReports(user.id);
    else fetchMyReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerRight: {
    width: 24, // Spacer for alignment
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  reportsList: {
    marginBottom: 24,
  },
  reportItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 0.7,
  },
  reportStatusResolved: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportStatusInProgress: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportStatusPending: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportDate: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: Colors.gray,
  },
});

export default MyReportsScreen;