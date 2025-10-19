// API Configuration
export const API_CONFIG = {
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '',
};

// Validation function to check if API key is configured
export const isApiKeyConfigured = (): boolean => {
  const { GEMINI_API_KEY } = API_CONFIG;
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 0);
};

// Optional: Log a warning in development if key is missing
if (!isApiKeyConfigured() && __DEV__) {
  console.warn(
    '⚠️ Gemini API key is not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.'
  );
}
