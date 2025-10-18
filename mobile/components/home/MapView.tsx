import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/colors';

interface MapViewProps {
  userType: 'anonymous' | 'user' | null;
}

const crimeReports = [
  { id: 1, type: 'Theft', lat: 18.0179, lng: -76.8099, date: '2025-10-10' },
  { id: 2, type: 'Vandalism', lat: 18.0199, lng: -76.8119, date: '2025-10-11' },
  { id: 3, type: 'Assault', lat: 18.0159, lng: -76.8079, date: '2025-10-12' },
];

const CustomMapView: React.FC<MapViewProps> = ({ userType }) => {
  // Initial region centered on Kingston, Jamaica
  const initialRegion = {
    latitude: 18.0256768,
    longitude: -76.7459328,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Show placeholder for anonymous users
  if (userType === 'anonymous') {
    return (
      <View style={styles.container}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color={Colors.primary} />
          <Text style={styles.mapText}>Interactive Map View</Text>
          <Text style={styles.mapSubtext}>Sign in to view crime reports</Text>
        </View>
      </View>
    );
  }

  // Show real map for registered users
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Crime Report Markers */}
        {crimeReports.map((crime) => (
          <Marker
            key={crime.id}
            coordinate={{
              latitude: crime.lat,
              longitude: crime.lng,
            }}
            title={crime.type}
            description={`Date: ${crime.date}`}
            pinColor={Colors.emergency}
          />
        ))}
      </MapView>

      {/* Crime Reports List Overlay */}
      <View style={styles.reportsOverlay}>
        <ScrollView
          style={styles.reportsContainer}
          showsVerticalScrollIndicator={false}
        >
          {crimeReports.map((crime) => (
            <View key={crime.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportType}>{crime.type}</Text>
                <Text style={styles.reportDate}>{crime.date}</Text>
              </View>
              <View style={styles.reportLocation}>
                <Ionicons name="location-outline" size={12} color={Colors.textLight} />
                <Text style={styles.reportLocationText}>
                  Tap marker on map to view details
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mapText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 12,
    fontWeight: '600',
  },
  mapSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  reportsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  reportsContainer: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportLocationText: {
    fontSize: 11,
    color: Colors.textLight,
  },
});

export default CustomMapView;