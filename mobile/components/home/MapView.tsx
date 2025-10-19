import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle, Polygon } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import { useUserProfile } from '../profile/UserProfileContext';

// Scaling function based on screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is the base width for iPhone
const verticalScale = SCREEN_HEIGHT / 812; // 812 is the base height for iPhone X

const scaleSize = (size: number) => Math.ceil(size * scale);
const scaleVertical = (size: number) => Math.ceil(size * verticalScale);

interface MapViewProps {
  userType: 'anonymous' | 'user' | null;
}

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  incidentType: string;
  witnesses: string;
  anonymous: boolean;
  name?: string;
  phone?: string;
  email?: string;
  mediaUri?: string;
  status: 'pending' | 'confirmed' | 'resolved';
}

interface MapViewProps {
  userType: 'anonymous' | 'user' | null;
}

const CustomMapView: React.FC<MapViewProps> = ({ userType }) => {
  const { user } = useUserProfile();
  const [reports, setReports] = useState<Report[]>([]);
  
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

  useEffect(() => {
    if (user && user.reports) {
      setReports(user.reports);
    } else {
      setReports([]);
    }
  }, [user]);

  // Parse coordinates from location string (simplified - in a real app, you'd use geocoding)
  const parseLocation = (location: string) => {
    // This is a simplified approach - in a real app, you'd use a geocoding service
    // For now, we'll use some predefined coordinates for common locations in Jamaica
    const locationCoords: Record<string, { latitude: number; longitude: number }> = {
      'Kingston': { latitude: 18.0179, longitude: -76.8099 },
      'Montego Bay': { latitude: 18.4712, longitude: -77.9181 },
      'Ocho Rios': { latitude: 18.3809, longitude: -77.0955 },
      'Portmore': { latitude: 18.0596, longitude: -76.8828 },
      'Spanish Town': { latitude: 17.9970, longitude: -77.1089 },
      'New Kingston': { latitude: 18.0071, longitude: -76.7930 },
      'Mandeville': { latitude: 18.0422, longitude: -77.4922 },
      'Negril': { latitude: 18.2864, longitude: -78.3579 },
    };

    for (const [city, coords] of Object.entries(locationCoords)) {
      if (location.toLowerCase().includes(city.toLowerCase())) {
        return coords;
      }
    }

    // If no match found, return default coordinates for Jamaica
    return { latitude: 18.1096, longitude: -77.2975 };
  };

  // Determine safety level based on incident type and count
  const getSafetyLevel = (incidentType: string): 'safe' | 'medium' | 'unsafe' => {
    // Define incident severity levels
    const severityMap: Record<string, 'safe' | 'medium' | 'unsafe'> = {
      'Theft': 'medium',
      'Robbery': 'unsafe',
      'Assault': 'unsafe',
      'Vandalism': 'medium',
      'Harassment': 'medium',
      'Drug Activity': 'medium',
      'Burglary': 'unsafe',
      'Vehicle Crime': 'medium',
      'Suspicious Activity': 'medium',
      'Other': 'medium',
    };

    return severityMap[incidentType] || 'medium';
  };

  // Calculate heatmap circles based on reports
  const getHeatmapCircles = () => {
    return reports.map((report) => {
      const coords = parseLocation(report.location);
      const safetyLevel = getSafetyLevel(report.incidentType);
      
      let fillColor = Colors.background; // Default
      let strokeColor = Colors.background; // Default
      
      switch (safetyLevel) {
        case 'safe':
          fillColor = 'rgba(0, 255, 0, 0.3)'; // Green for safe
          strokeColor = 'rgba(0, 255, 0, 0.8)';
          break;
        case 'medium':
          fillColor = 'rgba(255, 165, 0, 0.3)'; // Orange for medium/okay
          strokeColor = 'rgba(255, 165, 0, 0.8)';
          break;
        case 'unsafe':
          fillColor = 'rgba(255, 0, 0, 0.3)'; // Red for unsafe
          strokeColor = 'rgba(255, 0, 0, 0.8)';
          break;
      }

      return {
        id: report.id,
        coordinate: coords,
        radius: 1000, // 1 km radius
        fillColor,
        strokeColor,
        strokeWidth: 1,
      };
    });
  };
  
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
        {/* Safety Heatmap Circles - based on reports */}
        {reports.length > 0 && getHeatmapCircles().map((circle) => (
          <Circle
            key={circle.id}
            center={circle.coordinate}
            radius={circle.radius}
            fillColor={circle.fillColor}
            strokeColor={circle.strokeColor}
            strokeWidth={circle.strokeWidth}
          />
        ))}
        
        {/* Report Markers */}
        {reports.map((report) => {
          const coords = parseLocation(report.location);
          const safetyLevel = getSafetyLevel(report.incidentType);
          
          let pinColor = Colors.primary; // Default
          
          switch (safetyLevel) {
            case 'safe':
              pinColor = Colors.success; // Green for safe
              break;
            case 'medium':
              pinColor = Colors.warning; // Orange for medium/okay
              break;
            case 'unsafe':
              pinColor = Colors.danger; // Red for unsafe
              break;
          }
          
          return (
            <Marker
              key={report.id}
              coordinate={coords}
              title={report.title}
              description={`${report.incidentType} - ${report.date}`}
              pinColor={pinColor}
            />
          );
        })}
      </MapView>
      
      {/* Safety Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Safe</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>Okay to travel</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.danger }]} />
          <Text style={styles.legendText}>Not safe</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: scaleVertical(400),
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
    borderRadius: scaleSize(12),
    padding: scaleSize(12),
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
  legend: {
    position: 'absolute',
    top: scaleVertical(20),
    right: scaleSize(20),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: scaleSize(8),
    padding: scaleSize(12),
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleVertical(6),
  },
  legendColor: {
    width: scaleSize(16),
    height: scaleSize(16),
    borderRadius: scaleSize(8),
    marginRight: scaleSize(8),
  },
  legendText: {
    fontSize: scaleSize(12),
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default CustomMapView;