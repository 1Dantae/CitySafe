import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useUserProfile } from './UserProfileContext';

// Scaling function based on screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is the base width for iPhone
const verticalScale = SCREEN_HEIGHT / 812; // 812 is the base height for iPhone X

const scaleSize = (size: number) => Math.ceil(size * scale);
const scaleVertical = (size: number) => Math.ceil(size * verticalScale);

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
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(16),
    padding: scaleSize(24),
    alignItems: 'center',
    marginBottom: scaleVertical(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: scaleSize(100),
    height: scaleSize(100),
    borderRadius: scaleSize(50),
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleVertical(16),
  },
  profileName: {
    fontSize: scaleSize(24),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: scaleVertical(8),
  },
  profileEmail: {
    fontSize: scaleSize(16),
    color: Colors.gray,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(16),
    padding: scaleSize(24),
    marginBottom: scaleVertical(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleVertical(16),
  },
  sectionTitle: {
    fontSize: scaleSize(18),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  editForm: {
    marginBottom: scaleVertical(16),
  },
  inputGroup: {
    marginBottom: scaleVertical(16),
  },
  label: {
    fontSize: scaleSize(14),
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: scaleVertical(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: scaleSize(30),
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleVertical(12),
  },
  inputIcon: {
    marginRight: scaleSize(12),
  },
  input: {
    flex: 1,
    fontSize: scaleSize(16),
    color: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: scaleVertical(16),
    borderRadius: scaleSize(30),
    alignItems: 'center',
    marginTop: scaleVertical(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: scaleSize(18),
    fontWeight: '600',
  },
  infoList: {
    marginBottom: scaleVertical(16),
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: scaleVertical(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  infoLabel: {
    fontSize: scaleSize(16),
    color: Colors.gray,
  },
  infoValue: {
    fontSize: scaleSize(16),
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 0.6,
  },
  changePasswordButton: {
    backgroundColor: Colors.accent,
    paddingVertical: scaleVertical(16),
    borderRadius: scaleSize(30),
    alignItems: 'center',
    marginTop: scaleVertical(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleVertical(2) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  changePasswordButtonText: {
    color: Colors.primary,
    fontSize: scaleSize(18),
    fontWeight: '600',
  },

  passwordPlaceholder: {
    paddingVertical: scaleVertical(12),
    paddingHorizontal: scaleSize(16),
    backgroundColor: Colors.accent,
    borderRadius: scaleSize(8),
    alignItems: 'center',
  },
  passwordPlaceholderText: {
    fontSize: scaleSize(16),
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default ProfileScreen;