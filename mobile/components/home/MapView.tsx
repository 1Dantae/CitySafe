import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/colors';

// Scaling function based on screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is the base width for iPhone
const verticalScale = SCREEN_HEIGHT / 812; // 812 is the base height for iPhone X

const scaleSize = (size: number) => Math.ceil(size * scale);
const scaleVertical = (size: number) => Math.ceil(size * verticalScale);

interface MapViewProps {
  userType: 'anonymous' | 'user' | null;
}

const crimeReports = [
  { id: 1, type: 'Theft', lat: 18.0179, lng: -76.8099, date: '2025-10-10' },
  { id: 2, type: 'Vandalism', lat: 18.0199, lng: -76.8119, date: '2025-10-11' },
  { id: 3, type: 'Assault', lat: 18.0159, lng: -76.8079, date: '2025-10-12' },
];

const CustomMapView: React.FC<MapViewProps> = ({ userType }) => {
  // Jamaica boundary coordinates
  const jamaicaBounds = {
    northEast: { latitude: 18.55, longitude: -76.15 }, // Northeast corner of Jamaica
    southWest: { latitude: 17.65, longitude: -78.45 }, // Southwest corner of Jamaica
  };
  
  // Initial region centered on Jamaica
  const initialRegion = {
    latitude: 18.1096,
    longitude: -77.2975,
    latitudeDelta: 2, // Larger delta to show more of Jamaica
    longitudeDelta: 2,
  };
  
  const [currentRegion, setCurrentRegion] = React.useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(initialRegion);
  
  // Restrict map view to Jamaica boundaries
  const clampRegion = (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    // Ensure the center of the map stays within Jamaica bounds
    let latitude = region.latitude;
    let longitude = region.longitude;
    
    // Clamp latitude (north-south)
    latitude = Math.max(jamaicaBounds.southWest.latitude, 
                       Math.min(jamaicaBounds.northEast.latitude, latitude));
    
    // Clamp longitude (east-west)  
    longitude = Math.max(jamaicaBounds.southWest.longitude, 
                        Math.min(jamaicaBounds.northEast.longitude, longitude));
    
    return {
      latitude,
      longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    };
  };
  
  const handleRegionChangeComplete = (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    const clamped = clampRegion(region);
    setCurrentRegion(clamped);
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
        region={currentRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        minZoomLevel={8} // Limit how far out users can zoom
        maxZoomLevel={18} // Limit how far in users can zoom
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


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: scaleVertical(600),
    borderRadius: scaleSize(16),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    margin: scaleSize(16),
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
    padding: scaleSize(24),
  },
  mapText: {
    fontSize: scaleSize(16),
    color: Colors.primary,
    marginTop: scaleVertical(12),
    fontWeight: '600',
  },
  mapSubtext: {
    fontSize: scaleSize(14),
    color: Colors.textLight,
    marginTop: scaleVertical(8),
    textAlign: 'center',
  },
  reportsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: scaleVertical(150),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: scaleSize(20),
    borderTopRightRadius: scaleSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  reportsContainer: {
    padding: scaleSize(16),
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(2),
    padding: scaleSize(2),
    marginBottom: scaleVertical(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(1) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(2),
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleVertical(4),
  },
  reportType: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: Colors.primary,
  },
  reportDate: {
    fontSize: scaleSize(12),
    color: Colors.textLight,
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  reportLocationText: {
    fontSize: scaleSize(11),
    color: Colors.textLight,
  },
});

export default CustomMapView;