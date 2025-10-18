import { Ionicons } from '@expo/vector-icons';
import {
  launchCameraAsync,
  PermissionStatus,
  useCameraPermissions,
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
} from 'react-native';
import { Colors } from '../../constants/colors';

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
  const [cameraPermissionInformation, requestPermission] = useCameraPermissions();

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

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;

    const image = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!image.canceled) {
      setPickedImage(image.assets[0].uri);
    }
  }

  const handleSubmit = () => {
    if (!formData.incidentType || !formData.location || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

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
            {formData.incidentType || 'Type of Incident*'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {showTypePicker && (
          <View style={styles.pickerContainer}>
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setFormData({ ...formData, incidentType: type });
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
            placeholder="Date (MM/DD/YYYY)*"
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Time */}
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={24} color={Colors.white} />
          </View>
          <TextInput
            style={styles.fieldInput}
            placeholder="Time (HH:MM)*"
            value={formData.time}
            onChangeText={(text) => setFormData({ ...formData, time: text })}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Location */}
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={24} color={Colors.white} />
          </View>
          <TextInput
            style={styles.fieldInput}
            placeholder="Location of Incident*"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Witnesses */}
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={24} color={Colors.white} />
          </View>
          <TextInput
            style={styles.fieldInput}
            placeholder="Witness(es) of Incident"
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
        <View style={styles.fieldCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={24} color={Colors.white} />
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={takeImageHandler}>
            <Text style={styles.fieldText}>Take Photo / Video</Text>
          </TouchableOpacity>
          <Ionicons name="image" size={20} color={Colors.primary} />
        </View>

        {pickedImage && (
          <Image source={{ uri: pickedImage }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }} />
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
});

export default ReportScreen;
