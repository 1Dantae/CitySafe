import { Ionicons } from '@expo/vector-icons';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  useCameraPermissions,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import { format } from 'date-fns';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/colors';
import { useUserProfile } from '../profile/UserProfileContext';
import { submitReport, getReportById } from '../../services/api';
import * as Location from 'expo-location';

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
  const { user, addReport } = useUserProfile();
  const [formData, setFormData] = useState({
    incidentType: '',
    date: '',
    time: '',
    location: '',
    description: '',
    witnesses: '',
    anonymous: true,
    name: user?.fullName || '', // Pre-fill with user's name if authenticated
    phone: user?.phone || '',   // Pre-fill with user's phone if authenticated
    email: user?.email || '',   // Pre-fill with user's email if authenticated
  });

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCustomIncidentInput, setShowCustomIncidentInput] = useState(false);
  const [customIncident, setCustomIncident] = useState('');
  const [cameraPermissionInformation, requestPermission] = useCameraPermissions();
  const [mediaPermissionInformation, requestMediaPermission] = useMediaLibraryPermissions();

  // Handle address change with potential geocoding
  const handleAddressChange = (text: string) => {
    setFormData({ ...formData, location: text });
    
    // Clear suggestions if text is empty
    if (text.trim() === '') {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
  };

  // Select address from suggestions
  const selectAddressSuggestion = (suggestion: string) => {
    setFormData({ ...formData, location: suggestion });
    setAddressSuggestions([]);
    setShowSuggestions(false);
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



  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'MMM dd, yyyy'); // e.g., "Oct 18, 2025"
      setFormData({ ...formData, date: formattedDate });
    }
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

  // Helper function to determine media type based on file extension
  const getMediaType = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    if (!extension) return 'image';

    // Common image extensions
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return `image/${extension}`;
    }
    
    // Common video extensions
    if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(extension)) {
      return `video/${extension}`;
    }
    
    // Default to image if unknown
    return 'image';
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    // incident type
    const incidentTypeValue = formData.incidentType === 'Other' ? customIncident : formData.incidentType;
    if (!incidentTypeValue || incidentTypeValue.trim() === '') {
      Alert.alert('Validation error', 'Please select or enter the type of incident.');
      return false;
    }

    // location
    if (!formData.location || formData.location.trim() === '') {
      Alert.alert('Validation error', 'Please enter the location of the incident.');
      return false;
    }

    // description
    if (!formData.description || formData.description.trim() === '') {
      Alert.alert('Validation error', 'Please enter a description of the incident.');
      return false;
    }

    // contact info when not anonymous
    if (!formData.anonymous) {
      if (!formData.name || formData.name.trim() === '') {
        Alert.alert('Validation error', 'Please enter your name or toggle anonymous.');
        return false;
      }
      if (!formData.phone || formData.phone.trim() === '') {
        Alert.alert('Validation error', 'Please enter your phone number or toggle anonymous.');
        return false;
      }
      if (!formData.email || formData.email.trim() === '') {
        Alert.alert('Validation error', 'Please enter your email or toggle anonymous.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    // Validate form fields
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Request device location and include coordinates when available
      let lat: number | undefined = undefined;
      let lng: number | undefined = undefined;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      } catch (err) {
        console.warn('Could not get device location', err);
      }
      
      // Prepare report data
      // Ensure incidentType uses customIncident if provided and formats it correctly for backend
      const incidentTypeValue = formData.incidentType === 'Other' && customIncident
        ? customIncident.toLowerCase().replace(/\s+/g, '_')
        : formData.incidentType.toLowerCase().replace(/\s+/g, '_');

      // Fill default date/time if not provided
      const finalDate = formData.date && formData.date.trim() !== '' ? formData.date : format(new Date(), 'MMM dd, yyyy');
      const finalTime = formData.time && formData.time.trim() !== '' ? formData.time : format(new Date(), 'hh:mm a');

      // Sanitize media payload
      let mediaPayload: any = undefined;
      if (pickedImage) {
        const name = pickedImage.split('/').pop() || 'media';
        const type = getMediaType(pickedImage) || 'image/jpeg';
        mediaPayload = { uri: pickedImage, name, type };
      }

      const reportData: any = {
        incidentType: incidentTypeValue,
        date: finalDate,
        time: finalTime,
        location: formData.location,
        description: formData.description,
        witnesses: formData.witnesses, // Include witnesses field
        anonymous: formData.anonymous,
        name: formData.anonymous ? undefined : formData.name,
        phone: formData.anonymous ? undefined : formData.phone,
        email: formData.anonymous ? undefined : formData.email,
        media: mediaPayload,
      };

      // Submit report to backend
      // attach lat/lng if available
      if (lat !== undefined && lng !== undefined) {
        // @ts-ignore
        reportData.lat = lat;
        // @ts-ignore
        reportData.lng = lng;
      }

      // Get user ID if available
      const userId = user?.id;
      const result = await submitReport(reportData, userId);

      // fetch full report from backend and add to local context
      try {
        const full = await getReportById(result.id);
        // Transform backend document to local Report shape
        const formattedDate = full.createdAt ? new Date(full.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : (formData.date || new Date().toLocaleDateString());
        const reportObj = {
          id: full.id || result.id,
          title: full.incidentType || reportData.incident_type,
          description: full.description || reportData.description,
          location: full.location && typeof full.location === 'string' ? full.location : (full.location?.coordinates ? `${full.location.coordinates[1]}, ${full.location.coordinates[0]}` : formData.location),
          date: formattedDate,
          status: 'pending' as const,
        };
        addReport(reportObj);
      } catch (err) {
        console.warn('Could not fetch full report after submit', err);
      }

      Alert.alert('Success', 'Report submitted successfully!', [
        { text: 'OK', onPress: onBack },
      ]);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', `Failed to submit report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
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
        <TouchableOpacity
          style={styles.fieldCard}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={24} color={Colors.white} />
          </View>
          <Text style={styles.fieldText}>
            {formData.date || 'Date of Incident*'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerHeaderTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={formData.date ? new Date(Date.parse(formData.date)) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          </View>
        )}

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

        {/* Witnesses */}
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={24} color={Colors.white} />
          </View>
          <TextInput
            style={styles.fieldInput}
            placeholder="Witnesses (optional)"
            value={formData.witnesses}
            onChangeText={(text) => setFormData({ ...formData, witnesses: text })}
            placeholderTextColor={Colors.textLight}
          />
        </View>

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
            <Image source={{ uri: pickedImage }} style={styles.imagePreview} />
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
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Ionicons name="hourglass" size={24} color={Colors.white} />
              <Text style={styles.submitButtonText}>Submitting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={24} color={Colors.white} />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </>
          )}
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  fieldCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionCard: {
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  descriptionInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.emergencyDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  suggestionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    maxHeight: 150,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: Colors.primary,
  },
  pickerModal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primary,
  },
  pickerHeaderTitle: {
    fontSize: 18,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    backgroundColor: Colors.accent,
    borderRadius: 20,
    marginRight: 8,
  },
  photoButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
  },
});

export default ReportScreen;
