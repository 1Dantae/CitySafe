// Safety data and utilities for CitySafe app
export interface SafetyLocation {
  name: string;
  safetyLevel: 'safe' | 'moderate' | 'unsafe';
  description: string;
  tips: string[];
}

// Safety data for Jamaica locations
export const jamaicaSafetyData: Record<string, SafetyLocation> = {
  'kingston': {
    name: 'Kingston',
    safetyLevel: 'moderate',
    description: 'Capital city with areas of varying safety. Tourist areas like New Kingston are generally safer than downtown Kingston.',
    tips: [
      'Avoid downtown Kingston and Trench Town after dark',
      'Use registered taxis or car service',
      'Stay in well-lit, populated areas',
      'Be cautious when walking alone at night'
    ]
  },
  'montego bay': {
    name: 'Montego Bay',
    safetyLevel: 'safe',
    description: 'Popular tourist destination with generally good safety in resort areas.',
    tips: [
      'Stick to tourist areas and resorts',
      'Avoid walking alone after dark in non-tourist areas',
      'Use hotel-arranged transportation',
      'Keep valuables secure'
    ]
  },
  'negril': {
    name: 'Negril',
    safetyLevel: 'safe',
    description: 'Tourist-friendly area with beautiful beaches and generally safe conditions.',
    tips: [
      'Most areas are safe for tourists',
      'Avoid isolated beaches after dark',
      'Use reputable water sports operators',
      'Keep valuables secure at beach areas'
    ]
  },
  'ocho rios': {
    name: 'Ocho Rios',
    safetyLevel: 'safe',
    description: 'Popular resort town with good safety in tourist areas.',
    tips: [
      'Safe in tourist zones around main attractions',
      'Avoid walking in residential areas after dark',
      'Use hotel-arranged transportation',
      'Be cautious with personal belongings'
    ]
  },
  'spanish town': {
    name: 'Spanish Town',
    safetyLevel: 'moderate',
    description: 'Historical city with varying safety conditions.',
    tips: [
      'Avoid certain areas after dark',
      'Be especially vigilant during evening hours',
      'Use official transportation',
      'Stay in well-populated areas'
    ]
  }
};

export const getSafetyInfoForLocation = (location: string): SafetyLocation | null => {
  const normalizedLocation = location.toLowerCase().trim();
  
  // Try to match the location with our database
  for (const [key, data] of Object.entries(jamaicaSafetyData)) {
    if (normalizedLocation.includes(key) || data.name.toLowerCase().includes(normalizedLocation)) {
      return data;
    }
  }
  
  // If no specific match, return null
  return null;
};

export const generateSafetyRouteAdvice = (from: string, to: string): string => {
  let advice = `For traveling from ${from} to ${to}, here are some safety considerations:\n\n`;
  
  // General advice for Jamaica
  advice += "• Use main roads and highways when possible\n";
  advice += "• Avoid isolated paths and unknown areas\n";
  advice += "• Travel during daylight hours when possible\n";
  advice += "• Use well-populated, well-lit routes\n";
  advice += "• Let someone know your travel plans\n";
  advice += "• Keep valuables secure and out of sight\n";
  advice += "• Use registered transportation services\n";
  advice += "• Stay alert and aware of your surroundings\n";
  
  return advice;
};