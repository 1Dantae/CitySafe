import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface AdminDashboardProps {
  onLogout: () => void;
}

const crimeReports = [
  { id: 1, type: 'Theft', lat: 18.0179, lng: -76.8099, date: '2025-10-10', status: 'New' },
  { id: 2, type: 'Vandalism', lat: 18.0199, lng: -76.8119, date: '2025-10-11', status: 'New' },
  { id: 3, type: 'Assault', lat: 18.0159, lng: -76.8079, date: '2025-10-12', status: 'New' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Overview & Analytics</Text>
        </View>
        <TouchableOpacity onPress={onLogout}>
          <Ionicons name="log-out-outline" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={28} color={Colors.primary} />
            <Text style={styles.statNumber}>147</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="call" size={28} color={Colors.emergency} />
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Emergency Calls</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="people" size={28} color={Colors.primary} />
            <Text style={styles.statNumber}>1,234</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={28} color={Colors.primary} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {crimeReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportType}>{report.type}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{report.status}</Text>
                </View>
              </View>
              <View style={styles.reportDetails}>
                <View style={styles.reportDetail}>
                  <Ionicons name="location-outline" size={14} color={Colors.textLight} />
                  <Text style={styles.reportDetailText}>Location {report.id}</Text>
                </View>
                <View style={styles.reportDetail}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textLight} />
                  <Text style={styles.reportDetailText}>{report.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Crime Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crime Map</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={64} color={Colors.primary} />
            <Text style={styles.mapText}>Interactive Crime Map</Text>
            <Text style={styles.mapSubtext}>All reported incidents displayed</Text>
          </View>
        </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.75,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  reportDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  reportDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportDetailText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  mapPlaceholder: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    marginBottom: 32,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 16,
  },
  mapSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminDashboard;