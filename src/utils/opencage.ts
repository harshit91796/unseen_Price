import axios from 'axios';

const API_KEY = 'a40a5b6847dd432d8c9d862408f22c99';

export const fetchPlaceSuggestions = async (query: string) => {
  if (!query) return [];
  try {
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: query,
        key: API_KEY,
        limit: 5,
      },
    });
    return response.data.results.map((result: any) => ({
      formatted: {
        street: result.components.road,
        city: result.components.city,
        state: result.components.state,
        country: result.components.country,
      },
      coordinates: result.geometry,
    }));
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return [];
  }
};
