import { Platform } from 'react-native';

// Base URL for the backend API
// For Android emulator, use 10.0.2.2 to reach host machine's localhost
// For iOS simulator, use localhost
const BASE_URL = 
  typeof process.env.EXPO_PUBLIC_API_URL !== 'undefined' 
    ? process.env.EXPO_PUBLIC_API_URL 
    : Platform.OS === 'android' 
      ? 'http://10.0.2.2:8000' 
      : 'http://localhost:8000';

// Interface for report data
export interface ReportData {
  incidentType: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
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
 * @returns Promise with the report ID on success
 */
export const submitReport = async (reportData: ReportData): Promise<ReportResponse> => {
  try {
    const formData = new FormData();
    
    // Add text fields to form data
    formData.append('incident_type', reportData.incidentType);
    if (reportData.date) formData.append('date', reportData.date);
    if (reportData.time) formData.append('time', reportData.time);
    if (reportData.location) formData.append('location', reportData.location);
    if (reportData.description) formData.append('description', reportData.description);
    if (reportData.anonymous !== undefined) formData.append('anonymous', reportData.anonymous.toString());
    if (reportData.name) formData.append('name', reportData.name);
    if (reportData.phone) formData.append('phone', reportData.phone);
    if (reportData.email) formData.append('email', reportData.email);
    if (reportData.lat) formData.append('lat', reportData.lat.toString());
    if (reportData.lng) formData.append('lng', reportData.lng.toString());
    
    // Add media file if provided
    if (reportData.media) {
      const { uri, name, type } = reportData.media;
      formData.append('media', { uri, name, type } as any);
    }

    const response = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const result: ReportResponse = await response.json();
    return result;
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
    const response = await fetch(url);

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
    const response = await fetch(`${BASE_URL}/reports/${reportId}`);

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

// Export the base URL for potential use elsewhere
export { BASE_URL };