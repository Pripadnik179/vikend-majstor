// City coordinates for Serbian cities
// Used for distance filtering and geocoding fallback

export interface CityCoordinates {
  latitude: number;
  longitude: number;
}

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  // Major cities
  'Beograd': { latitude: 44.8176, longitude: 20.4633 },
  'Novi Sad': { latitude: 45.2671, longitude: 19.8335 },
  'Niš': { latitude: 43.3209, longitude: 21.8958 },
  'Kragujevac': { latitude: 44.0128, longitude: 20.9114 },
  'Subotica': { latitude: 46.1003, longitude: 19.6658 },
  
  // Other major cities
  'Zrenjanin': { latitude: 45.3816, longitude: 20.3862 },
  'Pančevo': { latitude: 44.8708, longitude: 20.6403 },
  'Čačak': { latitude: 43.8914, longitude: 20.3497 },
  'Kraljevo': { latitude: 43.7257, longitude: 20.6895 },
  'Novi Pazar': { latitude: 43.1367, longitude: 20.5122 },
  'Leskovac': { latitude: 42.9981, longitude: 21.9461 },
  'Šabac': { latitude: 44.7536, longitude: 19.6906 },
  'Užice': { latitude: 43.8589, longitude: 19.8425 },
  'Smederevo': { latitude: 44.6633, longitude: 20.9272 },
  'Sombor': { latitude: 45.7742, longitude: 19.1122 },
  'Valjevo': { latitude: 44.2706, longitude: 19.8914 },
  'Vranje': { latitude: 42.5514, longitude: 21.9000 },
  'Kruševac': { latitude: 43.5803, longitude: 21.3269 },
  'Požarevac': { latitude: 44.6214, longitude: 21.1894 },
  'Pirot': { latitude: 43.1531, longitude: 22.5856 },
  'Bor': { latitude: 44.0739, longitude: 22.0956 },
  'Zaječar': { latitude: 43.9042, longitude: 22.2850 },
  'Kikinda': { latitude: 45.8289, longitude: 20.4656 },
  'Vršac': { latitude: 45.1167, longitude: 21.3000 },
  'Sremska Mitrovica': { latitude: 44.9764, longitude: 19.6125 },
  'Jagodina': { latitude: 43.9775, longitude: 21.2611 },
  'Loznica': { latitude: 44.5333, longitude: 19.2258 },
  'Prokuplje': { latitude: 43.2339, longitude: 21.5875 },
  'Paraćin': { latitude: 43.8600, longitude: 21.4078 },
  'Inđija': { latitude: 45.0481, longitude: 20.0800 },
  'Stara Pazova': { latitude: 44.9853, longitude: 20.1639 },
  'Ruma': { latitude: 45.0081, longitude: 19.8225 },
  'Aranđelovac': { latitude: 44.3072, longitude: 20.5600 },
  'Ćuprija': { latitude: 43.9275, longitude: 21.3742 },
};

/**
 * Get coordinates for a city name
 * Returns null if city is not found
 */
export function getCityCoordinates(cityName: string): CityCoordinates | null {
  // Try exact match first
  if (CITY_COORDINATES[cityName]) {
    return CITY_COORDINATES[cityName];
  }
  
  // Try case-insensitive match
  const normalizedCity = cityName.trim();
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.toLowerCase() === normalizedCity.toLowerCase()) {
      return coords;
    }
  }
  
  return null;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
