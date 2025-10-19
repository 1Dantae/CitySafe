import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG, isApiKeyConfigured } from '../constants/apiConfig';
import { getSafetyInfoForLocation, jamaicaSafetyData } from './geminiSafetyService';

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY);

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const getGeminiResponse = async (userMessage: string, conversationHistory: Message[] = []): Promise<string> => {
  try {
    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      return "Error: Gemini AI API key is not configured. Please set your API key in the environment variables.";
    }
    
    // Check if the user is asking about a specific location for enhanced safety advice
    let enhancedContext = "";
    const locationNames = Object.keys(jamaicaSafetyData);
    const foundLocation = locationNames.find(loc => 
      userMessage.toLowerCase().includes(loc.toLowerCase())
    );
    
    if (foundLocation) {
      const safetyInfo = getSafetyInfoForLocation(foundLocation);
      if (safetyInfo) {
        enhancedContext = `\n\nSpecific information for ${safetyInfo.name}: Safety level is ${safetyInfo.safetyLevel}. ${safetyInfo.description}\n\nSafety tips for this area: ${safetyInfo.tips.join(', ')}.`;
      }
    }
    


    // Check if user is asking about safety in general
    const safetyKeywords = ['safety', 'safe', 'danger', 'crime', 'emergency', 'security', 'police', 'hospital', 'dangerous'];
    const hasSafetyKeyword = safetyKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasSafetyKeyword) {
      enhancedContext += `\n\nAs a safety-focused assistant, remember that personal safety is paramount. Always stay alert, aware of your surroundings, and trust your instincts. For emergencies, contact local authorities immediately.`;
    }

    // Get the generative model
    // Attempting to create model with system instruction but handling potential API version incompatibility
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
    });
    
    // Prepare the content array with conversation history and new user message
    // Add system instruction context to the user message since systemInstruction might not be supported
    const systemInstructionText = "You are a safety-focused assistant for the CitySafe app. Provide information about safe and unsafe areas in Jamaica, safety tips, crime statistics, and emergency procedures. When users ask about locations, provide safety assessments and local safety information. For safety recommendations, emphasize staying in well-lit areas, avoiding walking alone at night, keeping valuables secure, staying alert, trusting instincts, using official transportation, staying updated on local safety conditions, and using emergency features in the app. Be concise, accurate, and helpful while maintaining a friendly tone. If the user asks about safety in general, provide comprehensive safety advice relevant to Jamaica.\n\n";
    
    const contents = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts
      })),
      {
        role: 'user',
        parts: [{ text: systemInstructionText + userMessage + enhancedContext }]
      }
    ];

    // Generate content
    const result = await model.generateContent(contents);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from Gemini AI API');
    }

    return text;
  } catch (error: any) {
    console.error('Error calling Gemini AI API:', error);
    
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      return "Error: API key is invalid. Please check your Gemini AI API key configuration.";
    } else if (error.message && error.message.includes('429')) {
      return "Error: Rate limit exceeded. Please try again later.";
    } else {
      return "Sorry, I'm having trouble responding right now. Please try again.";
    }
  }
};