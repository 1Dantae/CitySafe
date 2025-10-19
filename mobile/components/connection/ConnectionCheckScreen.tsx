import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { checkConnection } from '../../services/api';

type ConnectionCheckScreenProps = {
  setCurrentScreen: (screen: string) => void;
};

const ConnectionCheckScreen: React.FC<ConnectionCheckScreenProps> = ({ setCurrentScreen }) => {
  const [checking, setChecking] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const result = await checkConnection();
        if (result.status === 'ok') {
          setConnectionStatus('connected');
          // Navigate to main app after successful verification
          setTimeout(() => {
            setCurrentScreen('home');
          }, 1000);
        } else {
          setConnectionStatus('disconnected');
          setChecking(false);
        }
      } catch (error) {
        setConnectionStatus('disconnected');
        setChecking(false);
        console.error('Connection check failed:', error);
      }
    };

    checkBackendConnection();
  }, [setCurrentScreen]);

  const renderContent = () => {
    if (connectionStatus === 'checking' || checking) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.title}>Connecting to Server</Text>
          <Text style={styles.subtitle}>Verifying connection to CitySafe backend...</Text>
        </View>
      );
    }

    if (connectionStatus === 'disconnected') {
      return (
        <View style={styles.contentContainer}>
          <Text style={[styles.title, styles.error]}>Connection Failed</Text>
          <Text style={styles.subtitle}>
            Unable to connect to the CitySafe backend server.
          </Text>
          <Text style={styles.errorText}>
            Please make sure the backend server is running and accessible.
          </Text>
          <Text style={styles.instructions}>
            {`1. Start the backend server (from the backend folder):\n  python -m uvicorn app:app --reload\n\nOR (from repo root):\n  python -m uvicorn backend.app:app --reload\n\n2. Ensure MongoDB is running\n3. Check that the server is accessible at the configured URL`}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Connection Successful</Text>
        <Text style={styles.subtitle}>Connected to CitySafe backend</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🛡️</Text>
        <Text style={styles.appName}>CitySafe</Text>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 80,
    alignItems: 'center',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  color: Colors.textLight,
  },
  error: {
    color: Colors.emergency,
  },
  errorText: {
    fontSize: 16,
    color: Colors.emergency,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'left',
    lineHeight: 22,
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginTop: 20,
  },
});

export default ConnectionCheckScreen;