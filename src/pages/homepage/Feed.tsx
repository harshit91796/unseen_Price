import './feed.css';
import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getAdvertisementNearby, getCategories, searchShops } from '../../Api';
import { calculateDistance, formatDistance } from '../../utils/distance';
import { categoryIcon } from '../../constants/categoryIcons';
import { filterByFrequencyCap, recordImpressions } from '../../utils/adFrequency';
import { LocationOn, ArrowBack, ArrowForward } from '@mui/icons-material';
import SafeImage from '../../components/SafeImage/SafeImage';
import SponsoredTag from '../../components/AdTags/SponsoredTag';
import usePageMeta from '../../hooks/usePageMeta';
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
const ROTATION_INTERVAL = 7000;            // sidebar ads — was 5s, bumped to 7s for readability
const BANNER_ROTATION_INTERVAL = 7000;     // banner — was 3s (way too fast for reading), now 7s

const Feed = () => {
  // Homepage keeps the site-wide default title and description from index.html.
  usePageMeta({ path: '/' });
 
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [bannerAds, setBannerAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [nearbyShops, setNearbyShops] = useState<any[]>([]);
  // Whether the list below was actually filtered by the viewer location, so
  // the heading only claims "near you" when that is true.
  const [shopsAreNearby, setShopsAreNearby] = useState(false);

  // One request, and the tiles match the shop dropdown. A failure leaves the
  // section empty rather than showing categories nothing can be listed under.
  useEffect(() => {
    let active = true;
    getCategories()
      .then((rows) => {
        if (!active) return;
        const list = Array.isArray(rows) ? rows : (rows?.data || []);
        setDbCategories(list.filter((c: any) => c && c.name));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Real shops, replacing twelve invented ones. Runs once the location has
  // resolved so it does not fire twice; falls back to the newest shops when
  // the viewer has not shared a location.
  useEffect(() => {
    if (locationLoading) return;
    let active = true;

    const latitude = userLocation?.coordinates?.latitude;
    const longitude = userLocation?.coordinates?.longitude;
    const byLocation = Number.isFinite(latitude) && Number.isFinite(longitude);

    const params = new URLSearchParams({ limit: '8' });
    if (byLocation) {
      params.set('latitude', String(latitude));
      params.set('longitude', String(longitude));
      params.set('radius', '15');
    }

    searchShops(params.toString())
      .then((response) => {
        if (!active) return;
        const list = Array.isArray(response) ? response : (response?.data || []);
        setNearbyShops(list.filter((shop: any) => shop && shop._id));
        setShopsAreNearby(byLocation);
      })
      .catch(() => {
        // An empty section is better than inventing shops that do not exist.
        if (active) setNearbyShops([]);
      });

    return () => { active = false; };
  }, [locationLoading, userLocation]);

  useEffect(() => {
    getUserLocation();
    
  }, []);

  useEffect(() => {
    // Wait until we actually have a location before calling the ad endpoint.
    // The backend requires longitude/latitude/state and errors out without them,
    // which would wipe the ads list on every initial mount.
    if (!userLocation?.coordinates?.latitude || !userLocation?.state) return;
    fetchAdvertisements();
  }, [userLocation]);

  // Record an impression for the banner ad that is actually visible right now.
  // Re-runs when the rotation moves to the next ad or when the banner list refreshes.
  // This way one home-page visit costs 1 impression per ad on screen, not 5 at once.
  useEffect(() => {
    const current = bannerAds[currentBannerIndex];
    if (current?._id) recordImpressions([current]);
  }, [currentBannerIndex, bannerAds]);

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
      // Frequency cap — hide ads this user has already seen too many times today.
      // If the cap empties the list, fall back to showing all (better something than nothing).
      const cappedAds = filterByFrequencyCap(activeAds);
      const finalAds = cappedAds.length > 0 ? cappedAds : activeAds;

      setAdvertisements(finalAds);
      setBannerAds(finalAds.slice(0, 5));
      // Impressions are recorded by the rotation effect below — only for the
      // ad currently visible, not the whole pool. This prevents the frequency
      // cap from being exhausted in a single visit.
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


  // Categories come from the database, the same list owners pick from when they
  // create a shop. They used to be hardcoded here, and the two lists had drifted:
  // Foods and Education were tiles on this page but not real categories, so no
  // shop could be in them and tapping either led to a permanently empty search.
  const categories = dbCategories.length > 0
    ? dbCategories.map((c: any) => ({ name: c.name, icon: categoryIcon(c.name, c.icon) }))
    : [];

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
              <SponsoredTag />
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
                    <button type="button" className="banner-ad-cta">
                      Visit <ArrowForward fontSize="small" />
                    </button>
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
            // Fallback hero — shown when no ads are available for the user's location
            <div className="banner-text">
              <h1>Discover Local <span className="accent-text">Shops & Services</span> Near You</h1>
              <p>
                From boutiques and salons to clinics and restaurants — find what your
                neighbourhood has to offer. Compare prices, read reviews, and support
                local businesses.
              </p>
              <div className="brands">
                <Link to="/search/all" className="banner-explore-cta">
                  Start exploring <ArrowForward fontSize="small" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
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
      )}

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

      {/* Real shops from the API. This block used to render twelve invented
          businesses with invented walking distances — ten of them the same shop
          repeated — under a heading that said "Near You", and the cards were
          plain divs so tapping one did nothing. Hidden entirely when there is
          nothing to show, rather than filled with placeholders. */}
      {nearbyShops.length > 0 && (
        <section className="trending-section">
          <h2>
            {shopsAreNearby ? (
              <>Shops Near <span className="accent-text">You</span></>
            ) : (
              <>Explore <span className="accent-text">Shops</span></>
            )}
          </h2>
          <div className="shops-grid">
            {nearbyShops.map((shop) => {
              const coords = shop?.targeting?.coordinates;
              const hasPin = Array.isArray(coords) && coords.length === 2 && (coords[0] || coords[1]);
              const latitude = userLocation?.coordinates?.latitude;
              const longitude = userLocation?.coordinates?.longitude;
              // Only shown when both ends are real; never estimated.
              // typeof, not Number.isFinite: only the former narrows the optional away.
              const distance = hasPin && typeof latitude === 'number' && typeof longitude === 'number'
                ? formatDistance(calculateDistance(latitude, longitude, coords[1], coords[0]))
                : '';
              const place = [shop?.address?.city, shop?.address?.state].filter(Boolean).join(', ');

              return (
                <Link to={`/shop/${shop._id}`} className="shop-card" key={shop._id}>
                  <div className="shop-image-wrapper">
                    <SafeImage
                      src={shop.images?.[0]}
                      alt={shop.name}
                      className="shop-image"
                      preset="CARD"
                    />
                  </div>
                  <div className="shop-info">
                    <h3>{shop.name}</h3>
                    {place && (
                      <p className="location">
                        <span className="location-icon">📍</span>
                        {place}
                      </p>
                    )}
                    {distance && (
                      <span className="distance">
                        <span className="distance-icon">🚶</span>
                        {distance}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Feed;
