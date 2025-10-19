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
import ConnectionCheckScreen from '../components/connection/ConnectionCheckScreen';
import { Colors } from '../constants/colors';
import { UserProfileProvider, useUserProfile } from '../components/profile/UserProfileContext';
import { NotificationProvider } from '../components/notifications/NotificationContext';
import { getAuthToken, getUserProfile, clearAuthToken, login, register } from '../services/api';

type Screen = 'welcome' | 'login' | 'signup' | 'home' | 'report' | 'profile' | 'myReports' | 'chat' | 'notifications' | 'connection';
type UserType = 'anonymous' | 'user' | null;

// Separate component to handle user profile logic
const AppContent = () => {
  // Start on connection check screen
  const [currentScreen, setCurrentScreen] = useState<Screen>('connection');
  const [userType, setUserType] = useState<UserType>(null);
  const { setUser } = useUserProfile();

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
          setCurrentScreen('welcome');
        }
      } else {
        // No token, show welcome screen
        setCurrentScreen('welcome');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentScreen('welcome');
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

  const handleRegister = async (userData: { fullName: string; email: string; phone: string; password: string }) => {
    try {
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
      await clearAuthToken();
      setUser(null);
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
            onAdminLogin={() => {}} // Admin login removed
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