// Utility functions for location-based services

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using browser's geolocation API
 * @returns Promise with user's coordinates
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Geocode a city name to coordinates (mock implementation)
 * In a real application, you would use Google Maps API or similar service
 */
export function getCityCoordinates(cityName: string): Coordinates | null {
  const cityCoordinates: Record<string, Coordinates> = {
    'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'Delhi': { latitude: 28.7041, longitude: 77.1025 },
    'Bengaluru': { latitude: 12.9716, longitude: 77.5946 },
    'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'Chennai': { latitude: 13.0827, longitude: 80.2707 },
    'Pune': { latitude: 18.5204, longitude: 73.8567 },
    'Ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
    'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'Gurgaon': { latitude: 28.4595, longitude: 77.0266 },
    'Gurugram': { latitude: 28.4595, longitude: 77.0266 },
    'Noida': { latitude: 28.5355, longitude: 77.3910 },
    'Jaipur': { latitude: 26.9124, longitude: 75.7873 },
    'Kochi': { latitude: 9.9312, longitude: 76.2673 },
    'Indore': { latitude: 22.7196, longitude: 75.8577 },
    'Coimbatore': { latitude: 11.0168, longitude: 76.9558 },
    'Chandigarh': { latitude: 30.7333, longitude: 76.7794 },
    'Lucknow': { latitude: 26.8467, longitude: 80.9462 },
  };

  return cityCoordinates[cityName] || null;
}

/**
 * Get the nearest city to the user's coordinates
 * @param userCoords User's current coordinates
 * @returns The nearest city name
 */
export function getNearestCity(userCoords: Coordinates): string | null {
  const cityCoordinates: Record<string, Coordinates> = {
    'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'Delhi': { latitude: 28.7041, longitude: 77.1025 },
    'Bengaluru': { latitude: 12.9716, longitude: 77.5946 },
    'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'Chennai': { latitude: 13.0827, longitude: 80.2707 },
    'Pune': { latitude: 18.5204, longitude: 73.8567 },
    'Ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
    'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'Gurgaon': { latitude: 28.4595, longitude: 77.0266 },
    'Noida': { latitude: 28.5355, longitude: 77.3910 },
    'Jaipur': { latitude: 26.9124, longitude: 75.7873 },
  };

  let nearestCity = null;
  let minDistance = Infinity;

  for (const [cityName, cityCoords] of Object.entries(cityCoordinates)) {
    const distance = calculateDistance(userCoords, cityCoords);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = cityName;
    }
  }

  return nearestCity;
}

/**
 * Extract location from search query
 * Looks for common location patterns and keywords
 */
export function extractLocationFromSearch(query: string): string | null {
  const cities = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Bangalore', 'Hyderabad', 'Chennai', 
    'Pune', 'Ahmedabad', 'Kolkata', 'Gurgaon', 'Gurugram', 'Noida', 
    'Jaipur', 'Kochi', 'Indore', 'Coimbatore', 'Chandigarh', 'Lucknow'
  ];

  const areas = [
    'BKC', 'Bandra Kurla Complex', 'Electronic City', 'Whitefield', 
    'Koregaon Park', 'Hinjewadi', 'Cyber City', 'HITEC City', 'OMR',
    'Connaught Place', 'Salt Lake', 'Andheri', 'Sector 62'
  ];

  const queryLower = query.toLowerCase();
  
  // Check for city names
  for (const city of cities) {
    if (queryLower.includes(city.toLowerCase())) {
      return city;
    }
  }

  // Check for area names and map to cities
  const areaToCity: Record<string, string> = {
    'bkc': 'Mumbai',
    'bandra kurla complex': 'Mumbai',
    'andheri': 'Mumbai',
    'electronic city': 'Bengaluru',
    'whitefield': 'Bengaluru',
    'koregaon park': 'Pune',
    'hinjewadi': 'Pune',
    'cyber city': 'Gurgaon',
    'hitec city': 'Hyderabad',
    'omr': 'Chennai',
    'connaught place': 'Delhi',
    'salt lake': 'Kolkata',
    'sector 62': 'Noida'
  };

  for (const [area, city] of Object.entries(areaToCity)) {
    if (queryLower.includes(area)) {
      return city;
    }
  }

  return null;
}
