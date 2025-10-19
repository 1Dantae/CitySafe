import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import LoginScreen from '../components/auth/LoginScreen';
import SignUpScreen from '../components/auth/SignUpScreen';
import WelcomeScreen from '../components/auth/WelcomeScreen';
import HomeScreen from '../components/home/HomeScreen';
import ReportScreen from '../components/report/ReportScreen';
import ProfileScreen from '../components/profile/ProfileScreen';
import MyReportsScreen from '../components/profile/MyReportsScreen';
import ChatScreen from '../components/chat/ChatScreen';
import NotificationScreen from '../components/notifications/NotificationScreen';
import { Colors } from '../constants/colors';
import { UserProfileProvider, useUserProfile } from '../components/profile/UserProfileContext';
import { NotificationProvider } from '../components/notifications/NotificationContext';

type Screen = 'welcome' | 'login' | 'signup' | 'home' | 'report' | 'profile' | 'myReports' | 'chat' | 'admin' | 'notifications';
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
      time: '08:30 AM',
      incidentType: 'Vandalism',
      witnesses: '2 people witnessed the outage',
      anonymous: false,
      name: 'John Doe',
      phone: '876-555-0123',
      email: 'john.doe@example.com',
      status: 'resolved' as const,
    },
    {
      id: '2',
      title: 'Pothole on Road',
      description: 'Large pothole on Highway 101 causing traffic hazards.',
      location: 'Highway 101',
      date: 'Oct 5, 2025',
      time: '14:45 PM',
      incidentType: 'Infrastructure',
      witnesses: 'Many drivers reported the issue',
      anonymous: true,
      status: 'in-progress' as const,
    },
    {
      id: '3',
      title: 'Graffiti Vandalism',
      description: 'Graffiti found on the community wall at Central Park.',
      location: 'Central Park',
      date: 'Sep 28, 2025',
      time: '19:20 PM',
      incidentType: 'Vandalism',
      witnesses: 'Security camera footage available',
      anonymous: false,
      name: 'Jane Smith',
      phone: '876-555-0456',
      email: 'jane.smith@example.com',
      status: 'pending' as const,
    },
  ];
};

// Separate component to handle user profile logic
const AppContent = () => {
  // Start on login screen per request
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userType, setUserType] = useState<UserType>(null);
  const { setUser, addReport } = useUserProfile();

  // Startup auth check is intentionally disabled so the app opens to the Login screen.
  // If you want automatic token validation, re-enable checkAuthStatus in this effect.
  // useEffect(() => { checkAuthStatus(); }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        // Validate token by fetching profile
        try {
          const profile = await getUserProfile();
          setUser({
            id: profile.id,
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone,
          });
          setUserType('user');
          setCurrentScreen('home');
        } catch (err) {
          console.error('Invalid or expired token, clearing:', err);
          await clearAuthToken();
          setCurrentScreen('connection');
        }
      } else {
        // No token, show connection screen
        setCurrentScreen('connection');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentScreen('connection');
    }
  };

  const handleSignIn = () => {
    setCurrentScreen('login');
  };

  const handleSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const loginData = await login({ email, password });
      // Update user state with the returned user data
      setUser({
        id: loginData.user.id,
        fullName: loginData.user.fullName,
        email: loginData.user.email,
        phone: loginData.user.phone,
      });
      setUserType('user');
      setCurrentScreen('home');
    } catch (error) {
      console.error('Login error:', error);
      // In a real app, you'd show an error message to the user
      throw error;
    }
  };

  const handleAdminLogin = () => {
    setUserType('admin');
    setCurrentScreen('admin');
  };

  const handleRegister = async (userData: { fullName: string; email: string; phone: string; password: string }) => {
    try {
      const { register } = await import('../services/api');
      const registerData = await register(userData);
      // Update user state with the returned user data
      setUser({
        id: registerData.user.id,
        fullName: registerData.user.fullName,
        email: registerData.user.email,
        phone: registerData.user.phone,
      });
      setUserType('user');
      setCurrentScreen('home');
    } catch (error) {
      console.error('Registration error:', error);
      // In a real app, you'd show an error message to the user
      throw error;
    }
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

  const handleLogout = async () => {
    try {
      // Import logout function to clear token
      const { logout } = await import('../services/api');
      await logout();
      
      setUserType(null);
      setCurrentScreen('welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const handleChat = () => {
    setCurrentScreen('chat');
  };

  const handleNotifications = () => {
    setCurrentScreen('notifications');
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
            onChat={handleChat}
            onNotifications={handleNotifications}
          />
        );
      
      case 'report':
        return <ReportScreen onBack={handleBackToHome} />;
      
      case 'profile':
        return <ProfileScreen onBack={handleBackToProfile} />;
      
      case 'myReports':
        return <MyReportsScreen onBack={handleBackToMyReports} />;
      
      case 'chat':
        return <ChatScreen onBack={handleBackToHome} />;
      
      case 'notifications':
        return <NotificationScreen onBack={handleBackToHome} />;
      
      /*case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      */
      default:
        return (
          <WelcomeScreen
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
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
    <NotificationProvider>
      <UserProfileProvider>
        <AppContent />
      </UserProfileProvider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
});