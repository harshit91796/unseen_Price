// src/hooks/useUserLocation.ts
import { useState, useEffect } from 'react';

interface UserLocation {
  coordinates: { latitude: number; longitude: number };
  city: string;
  state: string;
  country: string;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      setLocation(JSON.parse(stored));
      setLoading(false);
      return;
    }

    // Get from geolocation API
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // your geocoding logic here
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    }
  }, []);

  return { location, loading, error };
};

// Usage - replaces duplicated code in Feed.tsx, SearchPage.tsx, ProductDetails.tsx:
// const { location, loading: locationLoading } = useUserLocation();