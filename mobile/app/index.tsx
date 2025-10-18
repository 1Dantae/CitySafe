import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import AdminDashboard from '../components/admin/adminDashboard';
import LoginScreen from '../components/auth/LoginScreen';
import SignUpScreen from '../components/auth/SignUpScreen';
import WelcomeScreen from '../components/auth/WelcomeScreen';
import HomeScreen from '../components/home/HomeScreen';
import ReportScreen from '../components/report/ReportScreen';
import { Colors } from '../constants/colors';

type Screen = 'welcome' | 'login' | 'signup' | 'home' | 'report' | 'admin';
type UserType = 'anonymous' | 'user' | 'admin' | null;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userType, setUserType] = useState<UserType>(null);

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
    setUserType('user');
    setCurrentScreen('home');
  };

  const handleAdminLogin = () => {
    setUserType('admin');
    setCurrentScreen('admin');
  };

  const handleRegister = () => {
    setUserType('user');
    setCurrentScreen('home');
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

  const renderScreen = () => {
    switch (currentScreen) {
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
          />
        );
      
      case 'report':
        return <ReportScreen onBack={handleBackToHome} />;
      
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
});