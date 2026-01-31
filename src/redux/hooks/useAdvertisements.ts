// src/hooks/useAdvertisements.ts
import { useState, useEffect } from 'react';
import { getAdvertisements } from '../../Api';

export const useAdvertisements = (userLocation: any) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await getAdvertisements();
        const filtered = data.filter((ad: any) => {
          // your filtering logic
          return ad.isActive && !ad.isDeleted;
        });
        setAds(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAds();
  }, [userLocation]);

  return { ads, loading };
};

