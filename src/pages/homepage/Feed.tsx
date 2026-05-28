import './feed.css';
import { Link } from 'react-router-dom';
import { images, shopeImages } from '../../Pictures';
import { useEffect, useState, useCallback } from 'react';
import { getAdvertisementNearby } from '../../Api';
import { LocationOn, ArrowBack, ArrowForward } from '@mui/icons-material';
import SafeImage from '../../components/SafeImage/SafeImage';
interface Advertisement {
  _id: string;
  title: string;
  description: string;
  images: string[];
  link: string;
  targeting: {
    coordinates: [number, number];
    city: string;
    state: string;
    country: string;
    radius: number;
    targetType: 'CITY' | 'STATE' | 'GLOBAL';
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
  isDeleted: boolean;
}

interface UserLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  city: string;
  state: string;
  country: string;
}

const ADS_PER_PAGE = 3;
const ROTATION_INTERVAL = 5000;
const BANNER_ROTATION_INTERVAL = 3000;

const Feed = () => {
 
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [bannerAds, setBannerAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
    
  }, []);

  useEffect(() => {
    fetchAdvertisements();
  }, [userLocation]);

  const getUserLocation = async () => {
    try {
      // First try to get from localStorage
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setUserLocation(parsedLocation);
        setLocationLoading(false);
        return;
      }

      // If not in localStorage, get current position
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use Nominatim reverse geocoding to get city and state (free, no API key)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'User-Agent': 'UnseenPrice/1.0', 'Accept-Language': 'en' } }
            );
            const data = await response.json();

            if (data.address) {
              const addr = data.address;
              const locationData: UserLocation = {
                coordinates: { latitude, longitude },
                city: addr.city || addr.town || addr.village || addr.county || '',
                state: addr.state || '',
                country: addr.country || ''
              };

              // Store in localStorage
              localStorage.setItem('userLocation', JSON.stringify(locationData));
              setUserLocation(locationData);
            }
          } catch (error) {
            console.error('Error getting location details:', error);
          }
          setLocationLoading(false);
        }, (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
        });
      } else {
        console.log('Geolocation is not supported');
        setLocationLoading(false);
      }
    } catch (error) {
      console.error('Error in getUserLocation:', error);
      setLocationLoading(false);
    }
  };

  const fetchAdvertisements = async () => {
    try {
      const ads = await getAdvertisementNearby({
        longitude: userLocation?.coordinates?.longitude,
        latitude: userLocation?.coordinates?.latitude,
        state: userLocation?.state,
        city: userLocation?.city,
      });
      const activeAds = (Array.isArray(ads) ? ads : []).filter((ad: Advertisement) => {
        if (!ad) return false;
        const isActiveAndNotDeleted = ad.isActive && !ad.isDeleted;
        const isWithinDateRange =
          (!ad.startDate || new Date(ad.startDate) <= new Date()) &&
          (!ad.endDate || new Date(ad.endDate) >= new Date());
        return isActiveAndNotDeleted && isWithinDateRange;
      });
      setAdvertisements(activeAds);
      setBannerAds(activeAds.slice(0, 5));
    } catch (error) {
      console.error('Error in fetchAdvertisements:', error);
      setAdvertisements([]);
      setBannerAds([]);
    }
  };

  // Auto-rotate ads
  useEffect(() => {
    if (advertisements.length > ADS_PER_PAGE) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => {
          const nextIndex = prevIndex + ADS_PER_PAGE;
          return nextIndex >= advertisements.length ? 0 : nextIndex;
        });
      }, ROTATION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [advertisements]);

  // Auto-rotate banner ads
  useEffect(() => {
    if (bannerAds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          prevIndex === bannerAds.length - 1 ? 0 : prevIndex + 1
        );
      }, BANNER_ROTATION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [bannerAds]);

  const handleBannerNavigation = (direction: 'prev' | 'next') => {
    setCurrentBannerIndex(prevIndex => {
      if (direction === 'prev') {
        return prevIndex === 0 ? bannerAds.length - 1 : prevIndex - 1;
      } else {
        return prevIndex === bannerAds.length - 1 ? 0 : prevIndex + 1;
      }
    });
  };

  const getCurrentAds = useCallback(() => {
    return advertisements.slice(currentAdIndex, currentAdIndex + ADS_PER_PAGE);
  }, [advertisements, currentAdIndex]);

  const trendingShops = [
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop1 },
    { name: 'Variety clothes', location: 'roshan pura, bhopal', distance: '2km', image: shopeImages.shop2 },
    { name: 'Gen-Z', location: 'jawahar chowk, bhopal', distance: '1.8km', image: shopeImages.shop3 },
    { name: 'Dxter', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop4 },
    { name: 'Quality Wears', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop5 },
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop6 },
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop7 },
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop8 },
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop9 },
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop10 },
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop11 },
    { name: 'HD Boys', location: 'new market, bhopal', distance: '1.5km', image: shopeImages.shop12 }
  ];

  const categories = [
    { name: 'Clothes', icon: '👕' },
    { name: 'Footwear', icon: '👟' },
    { name: 'Student', icon: '🎓' },
    { name: 'Bicycles', icon: '🚲' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Vehicles', icon: '🚗' },
    { name: 'Electronics', icon: '📱' },
    { name: 'Foods', icon: '🍔' },
    { name: 'Medical & clinic', icon: '🏥' },
    { name: 'Sports', icon: '🏆' },
    { name: 'Education', icon: '📚' },
    { name: 'Toys & Games', icon: '🎮' },
    { name: 'Jewelry', icon: '💎' },
    { name: 'Other Services', icon: '💡' },
  ];

  return (
    <div className="feed-container container">
      {/* Location Display */}
      <div className="location-display">
        {locationLoading ? (
          <p>Detecting location...</p>
        ) : userLocation ? (
          <div className="current-location">
            <LocationOn />
            <span>{userLocation.city}, {userLocation.state}</span>
          </div>
        ) : (
          <p>Location not available</p>
        )}
      </div>

      {/* Banner Section */}
      <section className="banner">
        <div className="banner-content">
          {bannerAds.length > 0 ? (
            <div className="banner-ad">
              <a 
                href={bannerAds[currentBannerIndex].link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="banner-ad-link"
              >
                <div className="banner-ad-content">
                  <div className="banner-ad-text">
                    <h1>{bannerAds[currentBannerIndex].title}</h1>
                    <p>{bannerAds[currentBannerIndex].description}</p>
                    <div className="banner-ad-location">
                      <LocationOn />
                      <span>
                        {bannerAds[currentBannerIndex].targeting?.targetType === 'GLOBAL' 
                          ? 'Available Everywhere'
                          : bannerAds[currentBannerIndex].targeting?.targetType === 'STATE'
                          ? `Available in ${bannerAds[currentBannerIndex].targeting?.state || ''}`
                          : `Available in ${bannerAds[currentBannerIndex].targeting?.city || ''}`}
                      </span>
                    </div>
                  </div>
                  <div className="banner-ad-image">
                    <SafeImage
                      src={bannerAds[currentBannerIndex].images?.[0]}
                      alt={bannerAds[currentBannerIndex].title || 'Promotion'}
                      preset="HERO"
                      lazy={false}
                    />
                  </div>
                </div>
              </a>
              {bannerAds.length > 1 && (
                <div className="banner-navigation">
                  <button 
                    onClick={() => handleBannerNavigation('prev')}
                    className="banner-nav-button"
                  >
                    <ArrowBack />
                  </button>
                  <div className="banner-dots">
                    {bannerAds.map((_, index) => (
                      <button
                        key={index}
                        className={`banner-dot ${index === currentBannerIndex ? 'active' : ''}`}
                        onClick={() => setCurrentBannerIndex(index)}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => handleBannerNavigation('next')}
                    className="banner-nav-button"
                  >
                    <ArrowForward />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Fallback banner content
            <div className="banner-text">
              <h1>Reflect Who You Are with Our <span className="accent-text">Style</span></h1>
              <p>
                The power of a great outfit is impossible to overstate. At its best, 
                fashion has the ability to transform your mood, identity, and of course, 
                your look. It can be fun, refreshing, and purposeful.
              </p>
              <div className="brands">
                <span>Our Brand Partners: </span>
                <div className="brand-images">
                  {[images.product1, images.product2, images.product3, images.product4].map((image, index) => (
                    <img key={index} className='brand-image' src={image} alt={`Brand ${index + 1}`} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Explore <span className="accent-text">Categories</span></h2>
        <div className="categories">
          {categories.map((category, index) => (
            <Link to={`/search/${category.name}`} className="category-link" key={index}>
              <div className="category">
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Advertisements Section */}
      {advertisements.length > 0 ? (
        <section className="advertisements-section">
          <h2>Featured <span className="accent-text">Promotions</span></h2>
          <div className="ads-grid">
            {getCurrentAds().map((ad) => (
              <a 
                key={ad._id} 
                href={ad.link || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ad-card"
              >
                <div className="ad-image-wrapper">
                  <SafeImage src={ad.images?.[0]} alt={ad.title || 'Promotion'} className="ad-image" preset="AD" />
                </div>
                <div className="ad-info">
                  <h3>{ad.title}</h3>
                  <p>{ad.description}</p>
                  <span className="ad-location">
                    {ad.targeting?.targetType === 'GLOBAL' ? 'Available Everywhere' :
                     ad.targeting?.targetType === 'STATE' ? `Available in ${ad.targeting?.state || ''}` :
                     `Available in ${ad.targeting?.city || ''}`}
                  </span>
                </div>
              </a>
            ))}
          </div>
          {advertisements.length > ADS_PER_PAGE && (
            <div className="ads-pagination">
              {Array.from({ length: Math.ceil(advertisements.length / ADS_PER_PAGE) }).map((_, index) => (
                <button
                  key={index}
                  className={`pagination-dot ${index === Math.floor(currentAdIndex / ADS_PER_PAGE) ? 'active' : ''}`}
                  onClick={() => setCurrentAdIndex(index * ADS_PER_PAGE)}
                />
              ))}
            </div>
          )}
        </section>
      ) : !locationLoading && (
        <div className="no-ads-message">
          <p>No promotions available at the moment.</p>
        </div>
      )}

      {/* Trending Shops Section */}
      <section className="trending-section">
        <h2>Trending Shops Near <span className="accent-text">You</span></h2>
        <div className="shops-grid">
          {trendingShops.map((shop, index) => (
            <div className="shop-card" key={index}>
              <div className="shop-image-wrapper">
                <img src={shop.image} alt={shop.name} className="shop-image" />
              </div>
              <div className="shop-info">
                <h3>{shop.name}</h3>
                <p className="location">
                  <span className="location-icon">📍</span>
                  {shop.location}
                </p>
                <span className="distance">
                  <span className="distance-icon">🚶</span>
                  {shop.distance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Feed;
