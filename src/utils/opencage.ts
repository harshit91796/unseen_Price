import axios from 'axios';

// Nominatim (OpenStreetMap) — free, no API key required
// Policy: https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'UnseenPrice/1.0';

export const fetchPlaceSuggestions = async (query: string) => {
  if (!query) return [];
  try {
    const response = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    return response.data.map((result: any) => ({
      formatted: {
        street: result.address.road || result.address.pedestrian || result.address.suburb || '',
        city: result.address.city || result.address.town || result.address.village || result.address.county || '',
        state: result.address.state || '',
        country: result.address.country || '',
      },
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon), // Nominatim uses "lon", mapped to "lng" to match existing code
      },
    }));
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return [];
  }
};

export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE}/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    const addr = response.data.address;
    return {
      city: addr.city || addr.town || addr.village || addr.county || '',
      state: addr.state || '',
      country: addr.country || '',
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
};
