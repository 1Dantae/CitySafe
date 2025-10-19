import { Ionicons } from '@expo/vector-icons';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  useCameraPermissions,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../../constants/colors';
import { useUserProfile } from '../profile/UserProfileContext';
import { NotificationService } from '../../services/NotificationService';

// Scaling function based on screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is the base width for iPhone
const verticalScale = SCREEN_HEIGHT / 812; // 812 is the base height for iPhone X

const scaleSize = (size: number) => Math.ceil(size * scale);
const scaleVertical = (size: number) => Math.ceil(size * verticalScale);

interface ReportScreenProps {
  onBack: () => void;
}

const incidentTypes = [
  'Theft',
  'Robbery',
  'Assault',
  'Vandalism',
  'Harassment',
  'Drug Activity',
  'Burglary',
  'Vehicle Crime',
  'Suspicious Activity',
  'Other',
];

const ReportScreen: React.FC<ReportScreenProps> = ({ onBack }) => {
  const { addReport } = useUserProfile();
  const [formData, setFormData] = useState({
    incidentType: '',
    date: '',
    time: '',
    location: '',
    description: '',
    witnesses: '',
    anonymous: true,
    name: '',
    phone: '',
    email: '',
  });

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCustomIncidentInput, setShowCustomIncidentInput] = useState(false);
  const [customIncident, setCustomIncident] = useState('');
  const [cameraPermissionInformation, requestPermission] = useCameraPermissions();
  const [mediaPermissionInformation, requestMediaPermission] = useMediaLibraryPermissions();

  const isVideoFile = (uri: string): boolean => {
    const videoExtensions = ['.mov', '.mp4', '.avi', '.webm', '.wmv', '.flv', '.f4v', '.f4p', '.f4a', '.f4b'];
    return videoExtensions.some(ext => uri.toLowerCase().endsWith(ext));
  };

  async function verifyPermissions() {
    if (cameraPermissionInformation?.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }

    if (cameraPermissionInformation?.status === PermissionStatus.DENIED) {
      Alert.alert(
        'Insufficient Permissions!',
        'You need to grant camera access to use this feature.'
      );
      return false;
    }

    return true;
  }

  async function verifyMediaPermissions() {
    if (mediaPermissionInformation?.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestMediaPermission();
      return permissionResponse.granted;
    }

    if (mediaPermissionInformation?.status === PermissionStatus.DENIED) {
      Alert.alert(
        'Insufficient Permissions!',
        'You need to grant media library access to use this feature.'
      );
      return false;
    }

    return true;
  }

  async function takeImageOrVideoHandler() {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;

    const result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.All,  // Allow both images and videos
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  }

  async function chooseFromLibrary() {
    const hasPermission = await verifyMediaPermissions();
    if (!hasPermission) return;

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All, // Allow both images and videos
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  }

  // Mock function for address suggestions - in a real app, this would call an API
  const getAddressSuggestions = (input: string) => {
    // This is a mock implementation - in a real app, this would call an API like Google Places
    const jamaicaLocations = [
      "Kingston, Jamaica",
      "Montego Bay, Jamaica",
      "Ocho Rios, Jamaica",
      "Portmore, Jamaica", 
      "Spanish Town, Jamaica",
      "New Kingston, Jamaica",
      "Half Way Tree, Jamaica",
      "Mandeville, Jamaica",
      "St. Ann's Bay, Jamaica",
      "Falmouth, Jamaica",
      "Runaway Bay, Jamaica",
      "Negril, Jamaica",
      "Black River, Jamaica",
      "Port Antonio, Jamaica",
      "Mona Commons, Kingston",
      "Papine, Kingston",
      "Constant Spring, Kingston",
      "Liguanea, Kingston",
      "Cross Roads, Kingston",
      "Half Way Tree, St. Andrew"
    ];
    
    // Filter locations based on user input
    return jamaicaLocations.filter(location => 
      location.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5); // Return top 5 matches
  };

  const handleAddressChange = (text: string) => {
    setFormData({ ...formData, location: text });
    
    // If the user has entered at least 2 characters, show suggestions
    if (text.length >= 2) {
      const suggestions = getAddressSuggestions(text);
      setAddressSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectAddressSuggestion = (suggestion: string) => {
    setFormData({ ...formData, location: suggestion });
    setShowSuggestions(false);
  };

  const parseTimeToDateTime = (timeString: string): Date => {
    if (!timeString) return new Date();
    
    // Check if time is in 12-hour format (e.g., "10:30 AM")
    if (timeString.includes('AM') || timeString.includes('PM')) {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let hour = hours;
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      const date = new Date();
      date.setHours(hour, minutes, 0, 0);
      return date;
    } else {
      // If in 24-hour format, parse as before
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Convert to 12-hour format
      let hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = hours.toString().padStart(2, '0');
      
      const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
      setFormData({ ...formData, time: formattedTime });
    }
  };

  const handleSubmit = () => {
    if (!formData.incidentType || !formData.location || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Create a report object to add to the user's profile
    const reportDate = formData.date ? new Date(formData.date) : new Date();
    const formattedDate = reportDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const reportTitle = formData.incidentType === 'Other' && customIncident 
      ? customIncident 
      : formData.incidentType;
    
    const newReport = {
      id: Date.now().toString(), // In a real app, this was from the backend
      title: reportTitle,
      description: formData.description,
      location: formData.location,
      date: formattedDate,
      time: formData.time,
      incidentType: formData.incidentType,
      witnesses: formData.witnesses,
      anonymous: formData.anonymous,
      name: formData.anonymous ? undefined : formData.name,
      phone: formData.anonymous ? undefined : formData.phone,
      email: formData.anonymous ? undefined : formData.email,
      mediaUri: pickedImage,
      status: 'pending' as const,
    };

    // Add the report to the user's profile
    addReport(newReport);

    // Generate a notification for the new incident report
    NotificationService.generateIncidentReportNotification(newReport.title, newReport.location)
      .then(notification => {
        if (notification) {
          console.log('Notification created for incident report:', notification.title);
        }
      })
      .catch(error => {
        console.error('Error creating notification for incident report:', error);
      });

    Alert.alert('Success', 'Report submitted successfully!', [
      { text: 'OK', onPress: onBack },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Incident Type */}
        <TouchableOpacity
          style={styles.fieldCard}
          onPress={() => setShowTypePicker(!showTypePicker)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={24} color={Colors.white} />
          </View>
          <Text style={styles.fieldText}>
            {formData.incidentType === 'Other' && customIncident 
              ? customIncident 
              : formData.incidentType || 'Type of Incident*'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* Custom Incident Input - shown when 'Other' is selected */}
        {showCustomIncidentInput && (
          <View style={styles.fieldCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="document" size={24} color={Colors.white} />
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="Enter type of incident"
              value={customIncident}
              onChangeText={setCustomIncident}
              placeholderTextColor={Colors.textLight}
            />
          </View>
        )}

        {showTypePicker && (
          <View style={styles.pickerContainer}>
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  if (type === 'Other') {
                    setFormData({ ...formData, incidentType: type });
                    setShowCustomIncidentInput(true);
                  } else {
                    setFormData({ ...formData, incidentType: type });
                    setShowCustomIncidentInput(false);
                    setCustomIncident('');
                  }
                  setShowTypePicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date */}
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={24} color={Colors.white} />
          </View>
          <TextInput
            style={styles.fieldInput}
            placeholder="Date of Incident (e.g., Oct 18, 2025)*"
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            placeholderTextColor={Colors.textLight}
          />
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
        </View>

        {/* Time */}
        <TouchableOpacity
          style={styles.fieldCard}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={24} color={Colors.white} />
          </View>
          <Text style={styles.fieldText}>
            {formData.time || 'Time of Incident*'}
          </Text>
          <Ionicons name="time-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerHeaderTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={formData.time ? parseTimeToDateTime(formData.time) : new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
              is24Hour={false}  // This ensures 12-hour format on iOS
            />
          </View>
        )}

        {/* Location */}
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={24} color={Colors.white} />
          </View>
          <TextInput
            style={styles.fieldInput}
            placeholder="Location of Incident*"
            value={formData.location}
            onChangeText={handleAddressChange}
            placeholderTextColor={Colors.textLight}
          />
          <Ionicons name="location-outline" size={20} color={Colors.primary} />
        </View>

        {/* Address Suggestions */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {addressSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => selectAddressSuggestion(suggestion)}
              >
                <Ionicons name="location-outline" size={16} color={Colors.primary} style={styles.suggestionIcon} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}



        {/* Description */}
        <View style={[styles.fieldCard, styles.descriptionCard]}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={24} color={Colors.white} />
          </View>
          <TextInput
            style={[styles.fieldInput, styles.descriptionInput]}
            placeholder="Description of Incident*"
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Photo/Video Upload */}
        <View style={[styles.fieldCard, styles.photoCard]}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={24} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={takeImageOrVideoHandler} style={styles.photoButton}>
              <Ionicons name="camera-outline" size={20} color={Colors.primary} />
              <Text style={styles.photoButtonText}>Take Photo/Video</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={chooseFromLibrary} style={styles.photoButton}>
              <Ionicons name="images-outline" size={20} color={Colors.primary} />
              <Text style={styles.photoButtonText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pickedImage && (
          <View style={styles.imagePreviewContainer}>
            {isVideoFile(pickedImage) ? (
              <Video
                source={{ uri: pickedImage }}
                style={styles.imagePreview}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
              />
            ) : (
              <Image source={{ uri: pickedImage }} style={styles.imagePreview} />
            )}
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setPickedImage(null)}
            >
              <Ionicons name="close-circle" size={24} color={Colors.emergency} />
            </TouchableOpacity>
          </View>
        )}

        {/* Anonymous Toggle */}
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield" size={24} color={Colors.white} />
          </View>
          <Text style={styles.fieldText}>Remain Anonymous?*</Text>
          <Switch
            value={formData.anonymous}
            onValueChange={(value) =>
              setFormData({ ...formData, anonymous: value })
            }
            trackColor={{ false: Colors.gray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Contact Info (if not anonymous) */}
        {!formData.anonymous && (
          <>
            <View style={styles.fieldCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="person" size={24} color={Colors.white} />
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder="Name*"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.fieldCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="call" size={24} color={Colors.white} />
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder="Phone*"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.fieldCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={24} color={Colors.white} />
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder="Email*"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="send" size={24} color={Colors.white} />
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  backButton: {
    marginRight: scaleSize(16),
  },
  headerTitle: {
    fontSize: scaleSize(28),
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleVertical(24),
    paddingBottom: scaleVertical(40),
  },
  fieldCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleVertical(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  descriptionCard: {
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(12),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleSize(16),
  },
  fieldText: {
    flex: 1,
    fontSize: scaleSize(16),
    color: Colors.primary,
    fontWeight: '500',
  },
  fieldInput: {
    flex: 1,
    fontSize: scaleSize(16),
    color: Colors.primary,
    fontWeight: '500',
  },
  descriptionInput: {
    minHeight: scaleVertical(100),
    paddingTop: scaleVertical(12),
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(16),
    marginBottom: scaleVertical(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  pickerItem: {
    paddingVertical: scaleVertical(16),
    paddingHorizontal: scaleSize(24),
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  pickerItemText: {
    fontSize: scaleSize(16),
    color: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.emergencyDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleVertical(20),
    borderRadius: scaleSize(30),
    marginTop: scaleVertical(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: scaleSize(18),
    fontWeight: 'bold',
    marginLeft: scaleSize(12),
  },
  suggestionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(8),
    maxHeight: scaleVertical(150),
    marginBottom: scaleVertical(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
    zIndex: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  suggestionIcon: {
    marginRight: scaleSize(12),
  },
  suggestionText: {
    fontSize: scaleSize(16),
    color: Colors.primary,
  },
  pickerModal: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(16),
    marginBottom: scaleVertical(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scaleSize(16),
    backgroundColor: Colors.primary,
  },
  pickerHeaderTitle: {
    fontSize: scaleSize(18),
    fontWeight: 'bold',
    color: Colors.white,
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleVertical(8),
    paddingHorizontal: scaleSize(12),
    marginVertical: scaleVertical(4),
    backgroundColor: Colors.accent,
    borderRadius: scaleSize(20),
    marginRight: scaleSize(8),
  },
  photoButtonText: {
    color: Colors.primary,
    fontSize: scaleSize(14),
    fontWeight: '500',
    marginLeft: scaleSize(8),
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: scaleVertical(16),
  },
  imagePreview: {
    width: '100%',
    height: scaleVertical(200),
    borderRadius: scaleSize(12),
  },
  removeImageButton: {
    position: 'absolute',
    top: scaleSize(8),
    right: scaleSize(8),
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: scaleSize(4),
  },
});

export default ReportScreen;
