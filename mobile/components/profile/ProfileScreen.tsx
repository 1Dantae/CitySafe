import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useUserProfile } from './UserProfileContext';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, updateUser } = useUserProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSave = () => {
    if (user) {
      updateUser({ fullName, email, phone });
      setIsEditingProfile(false);
    }
  };

  const handleChangePassword = () => {
    // In a real app, this would involve API calls to change the password
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    // Here you would typically send the password change request to your backend
    // For now, just show a success message
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangingPassword(false); // Close the password change form
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.profileName}>
              {user?.fullName || 'User Name'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>

        {/* Edit Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => setIsEditingProfile(!isEditingProfile)}>
              <Ionicons 
                name={isEditingProfile ? "checkmark-circle" : "create-outline"} 
                size={24} 
                color={Colors.primary} 
              />
            </TouchableOpacity>
          </View>
          
          {isEditingProfile ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.fullName || 'Not provided'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setIsChangingPassword(!isChangingPassword)}>
              <Ionicons 
                name={isChangingPassword ? "close" : "create-outline"} 
                size={24} 
                color={Colors.primary} 
              />
            </TouchableOpacity>
          </View>
          
          {isChangingPassword ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current Password"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New Password"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    placeholder="Confirm New Password"
                    secureTextEntry={!showConfirmNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                    <Ionicons
                      name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.infoList}>
              <TouchableOpacity 
                style={styles.passwordPlaceholder}
                onPress={() => setIsChangingPassword(true)}
              >
                <Text style={styles.passwordPlaceholderText}>Tap to change password</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Report History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Report History</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.reportsList}>
            <TouchableOpacity style={styles.reportItem}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Street Light Outage</Text>
                <Text style={styles.reportStatus}>Resolved</Text>
              </View>
              <Text style={styles.reportDate}>Oct 10, 2025</Text>
              <Text style={styles.reportDescription}>The street light at the corner of Main St & 5th Ave is not working.</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.reportItem}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Pothole on Road</Text>
                <Text style={styles.reportStatus}>In Progress</Text>
              </View>
              <Text style={styles.reportDate}>Oct 5, 2025</Text>
              <Text style={styles.reportDescription}>Large pothole on Highway 101 causing traffic hazards.</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.reportItem}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Graffiti Vandalism</Text>
                <Text style={styles.reportStatusPending}>Pending</Text>
              </View>
              <Text style={styles.reportDate}>Sep 28, 2025</Text>
              <Text style={styles.reportDescription}>Graffiti found on the community wall at Central Park.</Text>
            </TouchableOpacity>
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
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.gray,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  editForm: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  infoList: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.gray,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 0.6,
  },
  changePasswordButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  changePasswordButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  reportsList: {
    marginBottom: 16,
  },
  reportItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 0.7,
  },
  reportStatus: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
    backgroundColor: '#dcfce7',
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
  passwordPlaceholder: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordPlaceholderText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default ProfileScreen;