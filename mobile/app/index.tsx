import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import AdminDashboard from '../components/admin/adminDashboard';
import LoginScreen from '../components/auth/LoginScreen';
import SignUpScreen from '../components/auth/SignUpScreen';
import WelcomeScreen from '../components/auth/WelcomeScreen';
import HomeScreen from '../components/home/HomeScreen';
import ReportScreen from '../components/report/ReportScreen';
import ProfileScreen from '../components/profile/ProfileScreen';
import MyReportsScreen from '../components/profile/MyReportsScreen';
import ConnectionCheckScreen from '../components/connection/ConnectionCheckScreen';
import { Colors } from '../constants/colors';
import { UserProfileProvider, useUserProfile } from '../components/profile/UserProfileContext';

type Screen = 'connection' | 'welcome' | 'login' | 'signup' | 'home' | 'report' | 'profile' | 'myReports' | 'admin';
type UserType = 'anonymous' | 'user' | 'admin' | null;

// Mock function to simulate user data initialization after login
const initializeUserData = (fullName: string, email: string, phone: string) => {
  // In a real app, this would fetch user data from an API
  return {
    id: '1', // In a real app, this would come from the backend
    fullName,
    email,
    phone,
  };
};

// Mock function to simulate report data
const initializeReportData = () => {
  // In a real app, this would fetch reports from an API
  return [
    {
      id: '1',
      title: 'Street Light Outage',
      description: 'The street light at the corner of Main St & 5th Ave is not working.',
      location: 'Main St & 5th Ave',
      date: 'Oct 10, 2025',
      status: 'resolved' as const,
    },
    {
      id: '2',
      title: 'Pothole on Road',
      description: 'Large pothole on Highway 101 causing traffic hazards.',
      location: 'Highway 101',
      date: 'Oct 5, 2025',
      status: 'in-progress' as const,
    },
    {
      id: '3',
      title: 'Graffiti Vandalism',
      description: 'Graffiti found on the community wall at Central Park.',
      location: 'Central Park',
      date: 'Sep 28, 2025',
      status: 'pending' as const,
    },
  ];
};

// Separate component to handle user profile logic
const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('connection');
  const [userType, setUserType] = useState<UserType>(null);
  const { setUser, addReport } = useUserProfile();

  const handleSignIn = () => {
    setCurrentScreen('login');
  };

  const handleSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleContinueAsGuest = () => {
    setUserType('anonymous');
    setCurrentScreen('home');
  };

  const handleLogin = () => {
    // In a real app, after successful login, we would get user data from the backend
    // For demo purposes, I'll use mock data that might have been stored from registration
    setUserType('user');
    setCurrentScreen('home');
    // Set mock user data - in a real app this would come from an API response
    setUser({
      id: '1',
      fullName: 'John Doe', // This would come from login response
      email: 'john.doe@example.com', // This would come from login response
      phone: '876-555-0123', // This would come from login response
    });
  };

  const handleAdminLogin = () => {
    setUserType('admin');
    setCurrentScreen('admin');
  };

  const handleRegister = (userData: { fullName: string; email: string; phone: string }) => {
    // In a real app, after successful registration, we would get user data from the backend
    // For demo purposes, we use the data from the sign up form
    setUserType('user');
    setCurrentScreen('home');
    // Set user data from registration
    setUser({
      id: '1',
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
    });
    
    // Initialize with some mock report data
    const mockReports = initializeReportData();
    mockReports.forEach(report => addReport(report));
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
    setUserType(null);
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleReport = () => {
    setCurrentScreen('report');
  };

  const handleLogout = () => {
    setUserType(null);
    setCurrentScreen('welcome');
  };

  const handleProfile = () => {
    setCurrentScreen('profile');
  };

  const handleMyReports = () => {
    setCurrentScreen('myReports');
  };

  const handleBackToProfile = () => {
    setCurrentScreen('home');
  };

  const handleBackToMyReports = () => {
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'connection':
        return <ConnectionCheckScreen setCurrentScreen={(screen) => setCurrentScreen(screen as Screen)} />;
      
      case 'welcome':
        return (
          <WelcomeScreen
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onContinueAsGuest={handleContinueAsGuest}
          />
        );
      
      case 'login':
        return (
          <LoginScreen
            onBack={handleBackToWelcome}
            onLogin={handleLogin}
            onAdminLogin={handleAdminLogin}
          />
        );
      
      case 'signup':
        return (
          <SignUpScreen
            onBack={handleBackToWelcome}
            onSignUp={handleRegister}
          />
        );
      
      case 'home':
        return (
          <HomeScreen
            userType={userType as 'anonymous' | 'user'}
            onReport={handleReport}
            onLogout={handleLogout}
            onProfile={handleProfile}
            onMyReports={handleMyReports}
          />
        );
      
      case 'report':
        return <ReportScreen onBack={handleBackToHome} />;
      
      case 'profile':
        return <ProfileScreen onBack={handleBackToProfile} />;
      
      case 'myReports':
        return <MyReportsScreen onBack={handleBackToMyReports} />;
      
      /*case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      */
      default:
        return (
          <WelcomeScreen
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onContinueAsGuest={handleContinueAsGuest}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {renderScreen()}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <UserProfileProvider>
      <AppContent />
    </UserProfileProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
});