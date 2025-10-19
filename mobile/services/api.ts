import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the backend API
// For Android emulator, use 10.0.2.2 to reach host machine's localhost
// For iOS simulator, use localhost
const BASE_URL = 
  typeof process.env.EXPO_PUBLIC_API_URL !== 'undefined' 
    ? process.env.EXPO_PUBLIC_API_URL 
    : Platform.OS === 'android' 
      ? 'http://10.0.2.2:8000' 
      : 'http://localhost:8000';

// Auth token management
const AUTH_TOKEN_KEY = 'auth_token';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

// Interface for report data
export interface ReportData {
  incidentType: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  witnesses?: string;
  anonymous?: boolean;
  name?: string;
  phone?: string;
  email?: string;
  lat?: number;
  lng?: number;
  media?: any; // For file upload
}

// Interface for API response
export interface ReportResponse {
  id: string;
}

/**
 * Submit a new report to the backend
 * @param reportData - The report data to submit
 * @param userId - Optional user ID to associate with the report
 * @returns Promise with the report ID on success
 */
export const submitReport = async (reportData: ReportData, userId?: string): Promise<ReportResponse> => {
  try {
    const formData = new FormData();
    
    // Add text fields to form data
    formData.append('incident_type', reportData.incidentType);
    if (reportData.date) formData.append('date', reportData.date);
    if (reportData.time) formData.append('time', reportData.time);
    if (reportData.location) formData.append('location', reportData.location);
    if (reportData.description) formData.append('description', reportData.description);
    if (reportData.witnesses) formData.append('witnesses', reportData.witnesses);
    if (reportData.anonymous !== undefined) formData.append('anonymous', reportData.anonymous.toString());
    if (reportData.name) formData.append('name', reportData.name);
    if (reportData.phone) formData.append('phone', reportData.phone);
    if (reportData.email) formData.append('email', reportData.email);
    if (reportData.lat) formData.append('lat', reportData.lat.toString());
    if (reportData.lng) formData.append('lng', reportData.lng.toString());
    if (userId) formData.append('user_id', userId);
    
    // Add media file if provided
    if (reportData.media) {
      const { uri, name, type } = reportData.media;
      formData.append('media', { uri, name, type } as any);
    }

    // Get auth token if available
    const authToken = await getAuthToken();
    const headers: { [key: string]: string } = {};
    // IMPORTANT: do NOT set Content-Type when sending FormData in React Native
    // The fetch implementation will set the correct multipart boundary automatically.
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = `${BASE_URL}/reports`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result: ReportResponse = await response.json();
      return result;
    } catch (err) {
      // Log useful debug info without exposing tokens
      console.error('Error submitting report to', url, 'authTokenPresent=', !!authToken, err);
      throw err;
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

/**
 * Get a list of reports from the backend
 * @param skip - Number of reports to skip (for pagination)
 * @param limit - Maximum number of reports to return
 * @returns Promise with array of reports
 */
export const getReports = async (skip: number = 0, limit: number = 100, userId?: string) => {
  try {
    let url = `${BASE_URL}/reports?skip=${skip}&limit=${limit}`;
    if (userId) url += `&user_id=${encodeURIComponent(userId)}`;
    
    const authToken = await getAuthToken();
    const headers: { [key: string]: string } = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reports = await response.json();
    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get a single report by ID
 * @param reportId - The ID of the report to retrieve
 * @returns Promise with the report data
 */
export const getReportById = async (reportId: string) => {
  try {
    const authToken = await getAuthToken();
    const headers: { [key: string]: string } = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Report not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const report = await response.json();
    return report;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

// Function to check backend connection
export const checkConnection = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Auth API functions
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let message = `HTTP error! status: ${response.status}`;
      try {
        const errorData = text ? JSON.parse(text) : {};
        const detail = errorData.detail;
        if (detail) {
          if (typeof detail === 'string') message = detail;
          else if (Array.isArray(detail)) {
            // Try to extract useful messages from validation array
            const parts = detail.map((d: any) => (d.msg ? d.msg : JSON.stringify(d)));
            message = parts.join(' | ');
          } else {
            message = JSON.stringify(detail);
          }
        } else if (errorData.message) {
          message = errorData.message;
        } else if (text) {
          message = text;
        }
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }

    const result: AuthResponse = await response.json();
    
    // Store the token for future requests
    await setAuthToken(result.token);
    
    return result;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let message = `HTTP error! status: ${response.status}`;
      try {
        const errorData = text ? JSON.parse(text) : {};
        const detail = errorData.detail;
        if (detail) {
          if (typeof detail === 'string') message = detail;
          else if (Array.isArray(detail)) {
            const parts = detail.map((d: any) => (d.msg ? d.msg : JSON.stringify(d)));
            message = parts.join(' | ');
          } else {
            message = JSON.stringify(detail);
          }
        } else if (errorData.message) {
          message = errorData.message;
        } else if (text) {
          message = text;
        }
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }

    const result: AuthResponse = await response.json();
    
    // Store the token for future requests
    await setAuthToken(result.token);
    
    return result;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Clear the stored token
    await clearAuthToken();
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<AuthResponse['user']> => {
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error('No auth token');

    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // map backend user shape to client User
    return {
      id: result.id || result._id,
      email: result.email,
      fullName: result.fullName || result.full_name || '',
      phone: result.phone,
    } as AuthResponse['user'];
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Export the base URL for potential use elsewhere
export { BASE_URL };