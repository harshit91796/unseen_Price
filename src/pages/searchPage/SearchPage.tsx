import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './searchPage.css';
import { Search, FilterList, Favorite, FavoriteBorder, Store, ShoppingBag, LocationOn, MyLocation, LocationOff, RoomService, Schedule, EventAvailable } from '@mui/icons-material';
import SafeImage from '../../components/SafeImage/SafeImage';
import StarRating from '../../components/Reviews/StarRating';
import PriceDisplay from '../../components/Price/PriceDisplay';
import StockBadge from '../../components/Price/StockBadge';
import { searchShops, searchProducts, searchServices, addToWishlist, removeFromWishlist, getWishlist, getAdvertisementNearby, getCategories } from '../../Api';
import { toast } from 'react-toastify';
import { Slider } from '@mui/material';
import { calculateDistance, formatDistance } from '../../utils/distance';
import { filterByFrequencyCap, recordImpressions } from '../../utils/adFrequency';

interface Shop {
  _id: string;
  name: string;
  images: string[];
  category: {
    name: string;
  };
  address: {
    city: string;
    state: string;
  };
  targeting: {
    coordinates: [number, number];
    city: string;
    state: string;
    country: string;
  };
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  isDeleted?: boolean;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  mrp?: number | null;
  stock?: number;
  isAvailable?: boolean;
  sizes?: string[];
  colors?: string[];
  shop: {
    name: string;
  };
  category: {
    name: string;
  };
  genderCategory: string;
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  isDeleted?: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ServiceOffering {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  mrp?: number | null;
  priceType: string;
  duration?: string;
  serviceType: string;
  category?: string;
  bookingRequired?: boolean;
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  shopId?: { _id: string; name: string; address?: any } | string;
  targeting?: { coordinates: [number, number] };
}

interface SearchResults {
  shops: Shop[];
  products: Product[];
  services: ServiceOffering[];
}


interface WishlistData {
  products: string[];
  shops: string[];
}

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

const SearchPage = () => {
  const catogoryParams = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState<'shops' | 'products' | 'services'>('shops');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    shops: [],
    products: [],
    services: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [wishlistData, setWishlistData] = useState<WishlistData>({ products: [], shops: [] });
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    serviceType: '',
    bookingRequired: ''
  });
  const [leftAds, setLeftAds] = useState<Advertisement[]>([]);
  const [rightAds, setRightAds] = useState<Advertisement[]>([]);
  const [visibleLeftAds, setVisibleLeftAds] = useState<Advertisement[]>([]);
  const [visibleRightAds, setVisibleRightAds] = useState<Advertisement[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  // const [sliderValue, setSliderValue] = useState(0);
  // const [isDragging, setIsDragging] = useState(false);
  // const [startPos, setStartPos] = useState(0);
  // const sliderRef = useRef<HTMLDivElement>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [category, setCategory] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Radius search state — persisted in localStorage
  const [searchRadius, setSearchRadius] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('searchRadius') || '15') || 15; } catch { return 15; }
  });
  const [radiusEnabled, setRadiusEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('radiusEnabled') !== 'false'; } catch { return true; }
  });
  const [citySearch, setCitySearch] = useState('');

  const ADS_PER_VIEW = 3;
  const ROTATION_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    console.log("catogoryParams",catogoryParams);
    const initializeData = async () => {
      try {
        // Test API connectivity
        console.log('Testing API connectivity...');
        await fetchWishlistData();
        await fetchCategories();
        console.log('API connectivity test passed');
      } catch (error) {
        console.error('Error initializing data:', error);
        console.error('API might be down or unreachable');
        toast.error('Unable to connect to server. Please check if the backend is running.');
      }
    };

    initializeData();

    // Get user location from localStorage
    try {
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        setUserLocation(JSON.parse(storedLocation));
      }
    } catch (error) {
      console.error('Error parsing user location:', error);
    }
  }, []);

  // Sync URL category param into the filter dropdown so manual search uses it too
  useEffect(() => {
    const urlCat = catogoryParams.category;
    if (urlCat && urlCat !== 'all') {
      setFilters(prev => ({ ...prev, category: urlCat }));
    } else {
      setFilters(prev => ({ ...prev, category: '' }));
    }
  }, [catogoryParams.category]);

  // Re-fetch ads when location OR active category changes (so ads match what user is browsing)
  useEffect(() => {
    fetchAdvertisements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, filters.category, catogoryParams.category]);

  // Rotate ads
  useEffect(() => {
    if (leftAds.length > ADS_PER_VIEW || rightAds.length > ADS_PER_VIEW) {
      const interval = setInterval(() => {
        // Rotate left ads
        if (leftAds.length > ADS_PER_VIEW) {
          setVisibleLeftAds(() => {
            const firstAd = leftAds[0];
            const restAds = leftAds.slice(1);
            const newAds = [...restAds, firstAd];
            setLeftAds(newAds);
            return newAds.slice(0, ADS_PER_VIEW);
          });
        }

        // Rotate right ads
        if (rightAds.length > ADS_PER_VIEW) {
          setVisibleRightAds(() => {
            const firstAd = rightAds[0];
            const restAds = rightAds.slice(1);
            const newAds = [...restAds, firstAd];
            setRightAds(newAds);
            return newAds.slice(0, ADS_PER_VIEW);
          });
        }
      }, ROTATION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [leftAds, rightAds]);

  // Initialize visible ads when ads are loaded
  useEffect(() => {
    setVisibleLeftAds(leftAds.slice(0, ADS_PER_VIEW));
    setVisibleRightAds(rightAds.slice(0, ADS_PER_VIEW));
  }, [leftAds, rightAds]);

  // Persist radius settings to localStorage
  useEffect(() => {
    localStorage.setItem('searchRadius', String(searchRadius));
    localStorage.setItem('radiusEnabled', String(radiusEnabled));
  }, [searchRadius, radiusEnabled]);

  // Debounced city search — when user types a city in "By City" mode, wait 500ms then re-trigger initial search
  const [debouncedCity, setDebouncedCity] = useState(citySearch);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(citySearch), 500);
    return () => clearTimeout(timer);
  }, [citySearch]);

  const fetchWishlistData = async () => {
    try {
      const response = await getWishlist();
      setWishlistData({
        products: response.products.map((p: any) => p._id),
        shops: response.shops.map((s: any) => s._id)
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getCategories();
      // Ensure response is an array
      if (Array.isArray(response)) {
        setCategory(response);
      } else if (response && Array.isArray(response.data)) {
        setCategory(response.data);
      } else {
        console.error('Categories response is not an array:', response);
        setCategory([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategory([]);
    } finally {
      setCategoriesLoading(false);
    }
  }

  const fetchAdvertisements = async () => {
    try {
      // Use the active category (URL param or filter dropdown) so ads match what user is browsing
      const adCategory = filters.category
        || (catogoryParams.category && catogoryParams.category !== 'all' ? catogoryParams.category : undefined);
      const ads = await getAdvertisementNearby({
        longitude: userLocation?.coordinates?.longitude,
        latitude: userLocation?.coordinates?.latitude,
        state: userLocation?.state,
        city: userLocation?.city,
        category: adCategory,
      });

      const activeAds = (Array.isArray(ads) ? ads : []).filter((ad: Advertisement) => {
        if (!ad) return false;
        const isActiveAndNotDeleted = ad.isActive && !ad.isDeleted;
        const isWithinDateRange =
          (!ad.startDate || new Date(ad.startDate) <= new Date()) &&
          (!ad.endDate || new Date(ad.endDate) >= new Date());
        return isActiveAndNotDeleted && isWithinDateRange;
      });

      // Apply daily-impression cap; fall back to all-ads if cap empties the list
      const cappedAds = filterByFrequencyCap(activeAds);
      const finalAds = cappedAds.length > 0 ? cappedAds : activeAds;

      const leftColumn: Advertisement[] = [];
      const rightColumn: Advertisement[] = [];
      finalAds.forEach((ad, index) => {
        if (index % 2 === 0) leftColumn.push(ad);
        else rightColumn.push(ad);
      });

      setLeftAds(leftColumn);
      setRightAds(rightColumn);
      // Record impressions for ads we're about to display in either column
      recordImpressions(finalAds);
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
      setLeftAds([]);
      setRightAds([]);
    }
  };

  const handleWishlist = async (id: string, type: 'shop' | 'product') => {
    try {
      const isInWishlist = type === 'shop' 
        ? wishlistData.shops.includes(id)
        : wishlistData.products.includes(id);

      if (isInWishlist) {
        await removeFromWishlist(type === 'product' ? id : undefined, type === 'shop' ? id : undefined);
        setWishlistData(prev => ({
          ...prev,
          [type === 'shop' ? 'shops' : 'products']: prev[type === 'shop' ? 'shops' : 'products'].filter(itemId => itemId !== id)
        }));
        toast.success(`${type === 'shop' ? 'Shop' : 'Product'} removed from wishlist`);
      } else {
        await addToWishlist(type === 'product' ? id : undefined, type === 'shop' ? id : undefined);
        setWishlistData(prev => ({
          ...prev,
          [type === 'shop' ? 'shops' : 'products']: [...prev[type === 'shop' ? 'shops' : 'products'], id]
        }));
        toast.success(`${type === 'shop' ? 'Shop' : 'Product'} added to wishlist`);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Allow empty search if user has at least a location filter (radius or city) or category param —
    // common case: "show me everything near me"
    const hasLocationFilter = (radiusEnabled && userLocation?.coordinates) || (!radiusEnabled && citySearch.trim());
    const hasAnyFilter = filters.category || filters.gender || filters.minPrice || filters.maxPrice
      || filters.serviceType || filters.bookingRequired;
    if (!searchQuery.trim() && !hasAnyFilter && !hasLocationFilter && !catogoryParams.category) {
      toast.warning('Please enter a search term or select filters');
      return;
    }

    setLoading(true);
    // setShowFilters(false);

    try {
      if (searchType === 'shops') {
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) {
          queryParams.append('name', searchQuery);
        }
        if (filters.category) {
          queryParams.append('category', filters.category);
        }
        if (filters.sortBy) {
          queryParams.append('sort', filters.sortBy);
        }
        // Pass user coordinates for radius-based search
        if (radiusEnabled && userLocation?.coordinates?.longitude && userLocation?.coordinates?.latitude) {
          queryParams.append('longitude', String(userLocation.coordinates.longitude));
          queryParams.append('latitude', String(userLocation.coordinates.latitude));
          queryParams.append('radius', String(searchRadius));
        } else if (!radiusEnabled && citySearch.trim()) {
          queryParams.append('city', citySearch.trim());
        }
        // Add pagination parameters
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', itemsPerPage.toString());
        const response = await searchShops(queryParams.toString());
        console.log('Shop search response:', response);
        console.log('Shop search response type:', typeof response);
        console.log('Shop search response is array:', Array.isArray(response));
        
        // Handle both old format (array) and new format (paginated object)
        let shopResults: Shop[] = [];
        let paginationInfo: PaginationInfo | null = null;
        
        if (Array.isArray(response)) {
          // Old format - direct array
          shopResults = response;
        } else if (response?.data && Array.isArray(response.data)) {
          // New format - paginated response
          shopResults = response.data;
          paginationInfo = response.pagination;
        }
        
        console.log('Processed shop results:', shopResults);
        console.log('Pagination info:', paginationInfo);
        
        setSearchResults(prev => ({ ...prev, shops: shopResults }));
        setPagination(paginationInfo);
      } else if (searchType === 'products') {
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) {
          queryParams.append('name', searchQuery);
        }
        if (filters.category) {
          queryParams.append('category', filters.category);
        }
        if (filters.gender && filters.gender !== '') {
          queryParams.append('genderCategory', filters.gender);
        }
        if (filters.minPrice) {
          queryParams.append('minPrice', filters.minPrice);
        }
        if (filters.maxPrice) {
          queryParams.append('maxPrice', filters.maxPrice);
        }
        if (filters.sortBy) {
          queryParams.append('sort', filters.sortBy);
        }
        if(filters.category && filters.category == 'All Categories'){
          queryParams.append('category', '');
        }
        if(filters.gender && filters.gender == 'All'){
          queryParams.append('genderCategory', '');
        }
        // Pass user coordinates for radius-based search
        if (radiusEnabled && userLocation?.coordinates?.longitude && userLocation?.coordinates?.latitude) {
          queryParams.append('longitude', String(userLocation.coordinates.longitude));
          queryParams.append('latitude', String(userLocation.coordinates.latitude));
          queryParams.append('radius', String(searchRadius));
        } else if (!radiusEnabled && citySearch.trim()) {
          queryParams.append('location', citySearch.trim());
        }
        // Add pagination parameters
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', itemsPerPage.toString());
        const response = await searchProducts(queryParams.toString());
        console.log('Product search response:', response);
        console.log('Product search response type:', typeof response);
        console.log('Product search response is array:', Array.isArray(response));
        
        // Handle both old format (array) and new format (paginated object)
        let productResults: Product[] = [];
        let paginationInfo: PaginationInfo | null = null;
        
        if (Array.isArray(response)) {
          // Old format - direct array
          productResults = response;
        } else if (response?.data && Array.isArray(response.data)) {
          // New format - paginated response
          productResults = response.data;
          paginationInfo = response.pagination;
        }
        
        console.log('Processed product results:', productResults);
        console.log('Pagination info:', paginationInfo);
        
        setSearchResults(prev => ({ ...prev, products: productResults }));
        setPagination(paginationInfo);
      } else if (searchType === 'services') {
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) queryParams.append('name', searchQuery);
        if (filters.category && filters.category !== 'All Categories') queryParams.append('category', filters.category);
        if (filters.serviceType) queryParams.append('serviceType', filters.serviceType);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.bookingRequired) queryParams.append('bookingRequired', filters.bookingRequired);
        if (filters.sortBy) queryParams.append('sort', filters.sortBy);
        if (radiusEnabled && userLocation?.coordinates?.longitude && userLocation?.coordinates?.latitude) {
          queryParams.append('longitude', String(userLocation.coordinates.longitude));
          queryParams.append('latitude', String(userLocation.coordinates.latitude));
          queryParams.append('radius', String(searchRadius));
        } else if (!radiusEnabled && citySearch.trim()) {
          queryParams.append('location', citySearch.trim());
        }
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', itemsPerPage.toString());

        const response = await searchServices(queryParams.toString());
        let serviceResults: ServiceOffering[] = [];
        let paginationInfo: PaginationInfo | null = null;
        if (Array.isArray(response)) {
          serviceResults = response;
        } else if (response?.data && Array.isArray(response.data)) {
          serviceResults = response.data;
          paginationInfo = response.pagination;
        }
        setSearchResults(prev => ({ ...prev, services: serviceResults }));
        setPagination(paginationInfo);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 3000.');
      } else {
        toast.error('Failed to fetch search results');
      }
      // Set empty results on error
      setSearchResults({ shops: [], products: [], services: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
    // Don't call handleSearch() here — it reads stale state. The performInitialSearch
    // useEffect handles re-fetching when filters change (filter values are in its deps).
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFilters(prev => ({
      ...prev,
      gender: value
    }));
    setCurrentPage(1);
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handlePriceChangeCommitted = (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    const [min, max] = newValue as [number, number];
    setFilters(prev => ({
      ...prev,
      minPrice: min.toString(),
      maxPrice: max.toString()
    }));
    // Reset to page 1 when price changes
    setCurrentPage(1);
    handleSearch();
  };

  useEffect(() => {
    console.log('Initial search effect triggered');
    console.log('catogoryParams:', catogoryParams);
    console.log('searchType:', searchType);
    
    const performInitialSearch = async () => {
      if (!catogoryParams.category) {
        console.log('No category parameter, skipping initial search');
        return;
      }

      // Effective category: prefer the user's dropdown choice; fall back to URL param
      const effectiveCategory = filters.category
        || (catogoryParams.category && catogoryParams.category !== 'all' ? catogoryParams.category : '');
      const parts: string[] = [];
      if (effectiveCategory) parts.push(`category=${encodeURIComponent(effectiveCategory)}`);
      if (searchType === 'products' && filters.gender) parts.push(`genderCategory=${encodeURIComponent(filters.gender)}`);
      if (searchType === 'services' && filters.serviceType) parts.push(`serviceType=${encodeURIComponent(filters.serviceType)}`);
      if (searchType === 'services' && filters.bookingRequired) parts.push(`bookingRequired=${encodeURIComponent(filters.bookingRequired)}`);
      if (filters.minPrice) parts.push(`minPrice=${encodeURIComponent(filters.minPrice)}`);
      if (filters.maxPrice) parts.push(`maxPrice=${encodeURIComponent(filters.maxPrice)}`);

      const storedLoc = (() => { try { return JSON.parse(localStorage.getItem('userLocation') || ''); } catch { return null; } })();
      // For services/products tabs, the backend uses "location" param (not "city"). Shops use "city".
      const cityParamName = searchType === 'shops' ? 'city' : 'location';
      if (radiusEnabled && storedLoc?.coordinates?.longitude && storedLoc?.coordinates?.latitude) {
        parts.push(`longitude=${storedLoc.coordinates.longitude}`);
        parts.push(`latitude=${storedLoc.coordinates.latitude}`);
        parts.push(`radius=${searchRadius}`);
      } else if (!radiusEnabled && debouncedCity.trim()) {
        parts.push(`${cityParamName}=${encodeURIComponent(debouncedCity.trim())}`);
      }
      parts.push(`page=${currentPage}`);
      parts.push(`limit=${itemsPerPage}`);

      const queryString = parts.join('&');
      console.log('Query string:', queryString);

      try {
        if (searchType === 'shops') {
          console.log('Searching for shops...');
          const response = await searchShops(queryString);
          console.log('Initial shop search response:', response);
          
          // Handle both old format (array) and new format (paginated object)
          let shopResults: Shop[] = [];
          let paginationInfo: PaginationInfo | null = null;
          
          if (Array.isArray(response)) {
            shopResults = response;
          } else if (response?.data && Array.isArray(response.data)) {
            shopResults = response.data;
            paginationInfo = response.pagination;
          }
          
          console.log('Initial processed shop results:', shopResults);
          setSearchResults(prev => ({ ...prev, shops: shopResults }));
          setPagination(paginationInfo);
        } else if (searchType === 'services') {
          console.log('Searching for services...');
          const response = await searchServices(queryString);
          let serviceResults: ServiceOffering[] = [];
          let paginationInfo: PaginationInfo | null = null;

          if (Array.isArray(response)) {
            serviceResults = response;
          } else if (response?.data && Array.isArray(response.data)) {
            serviceResults = response.data;
            paginationInfo = response.pagination;
          }
          setSearchResults(prev => ({ ...prev, services: serviceResults }));
          setPagination(paginationInfo);
        } else {
          console.log('Searching for products...');
          const response = await searchProducts(queryString);
          console.log('Initial product search response:', response);

          // Handle both old format (array) and new format (paginated object)
          let productResults: Product[] = [];
          let paginationInfo: PaginationInfo | null = null;

          if (Array.isArray(response)) {
            productResults = response;
          } else if (response?.data && Array.isArray(response.data)) {
            productResults = response.data;
            paginationInfo = response.pagination;
          }

          console.log('Initial processed product results:', productResults);
          setSearchResults(prev => ({ ...prev, products: productResults }));
          setPagination(paginationInfo);
        }
      } catch (error: any) {
        console.error('Search error:', error);
        if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
          toast.error('Cannot connect to server. Please ensure the backend is running on port 3000.');
        } else {
          toast.error('Failed to fetch search results');
        }
        // Set empty results on error
        if (searchType === 'shops') {
          setSearchResults(prev => ({ ...prev, shops: [] }));
        } else if (searchType === 'services') {
          setSearchResults(prev => ({ ...prev, services: [] }));
        } else {
          setSearchResults(prev => ({ ...prev, products: [] }));
        }
      }
    };

    performInitialSearch();
  }, [
    searchType,
    catogoryParams.category,
    currentPage,
    itemsPerPage,
    searchRadius,
    radiusEnabled,
    debouncedCity,
    filters.category,
    filters.gender,
    filters.serviceType,
    filters.bookingRequired,
    filters.minPrice,
    filters.maxPrice
  ]);

  // Debug effect to log search results changes
  useEffect(() => {
    console.log('Search results updated:', searchResults);
  }, [searchResults]);

  const getShopDistance = (shop: Shop): string => {
    if (!userLocation?.coordinates?.latitude || !userLocation?.coordinates?.longitude || !shop.targeting?.coordinates) {
      return 'Distance unavailable';
    }

    const distance = calculateDistance(
      userLocation.coordinates.latitude,
      userLocation.coordinates.longitude,
      shop.targeting.coordinates[1], // latitude
      shop.targeting.coordinates[0]  // longitude
    );

    return formatDistance(distance);
  };

  return (
    <div className="search-page-wrapper">
      {/* Left Ads */}
      <div className="vertical-ads">
        <div className="vertical-ads-container">
          {visibleLeftAds.length > 0 ? (
            visibleLeftAds.map((ad) => (
              <a 
                key={ad._id}
                href={ad.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="vertical-ad-card"
              >
                <SafeImage
                  src={ad.images?.[0]}
                  alt={ad.title || 'Promotion'}
                  className="vertical-ad-image"
                  preset="AD"
                />
                <div className="vertical-ad-content">
                  <div>
                    <h3>{ad.title}</h3>
                    <p>{ad.description}</p>
                  </div>
                  <div className="vertical-ad-location">
                    <LocationOn />
                    <span>
                      {ad.targeting?.targetType === 'GLOBAL' 
                        ? 'Available Everywhere'
                        : ad.targeting?.targetType === 'STATE'
                        ? `Available in ${ad.targeting?.state || ''}`
                        : `Available in ${ad.targeting?.city || ''}`}
                    </span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="no-ads">No advertisements available</div>
          )}
        </div>
      </div>

      {/* Main Search Content */}
      <div className="search-page-container">
        {/* <ToastContainer /> */}
        <div className="search-section">
          <div className="search-type-toggle">
            <button 
              className={`toggle-btn ${searchType === 'shops' ? 'active' : ''}`}
              onClick={() => {
                setSearchType('shops');
                setCurrentPage(1); // Reset to page 1 when changing search type
              }}
            >
              <Store /> Shops
            </button>
            <button
              className={`toggle-btn ${searchType === 'products' ? 'active' : ''}`}
              onClick={() => {
                setSearchType('products');
                setCurrentPage(1); // Reset to page 1 when changing search type
              }}
            >
              <ShoppingBag /> Products
            </button>
            <button
              className={`toggle-btn ${searchType === 'services' ? 'active' : ''}`}
              onClick={() => {
                setSearchType('services');
                setCurrentPage(1);
              }}
            >
              <RoomService /> Services
            </button>
          </div>

          <form onSubmit={handleSearch} className="search-bar">
            <div className="search-input-group">
              <Search />
              <input
                type="text"
                className="search-input"
                placeholder={`Search for ${searchType === 'shops' ? 'shops by name, category...' : 'products by name, brand...'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterList />
              Filters {showFilters ? '▲' : '▼'}
            </button>
            <button type="submit" className="search-button" onClick={()=> setShowFilters(false)}>Search</button>
          </form>

          <div className={`filters-dropdown ${!showFilters ? 'hidden' : ''}`}>
            <div className="filters-grid">
              <div className="filter-group">
                <h3>Category</h3>
                <select
                  name="category"
                  className="filter-select"
                  value={filters.category}
                  onChange={handleFilterChange}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'All Categories'}
                  </option>
                  {!categoriesLoading && Array.isArray(category) && category.map((cat: any, index: number) => (
                    <option key={cat._id || index} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {searchType === 'products' && (
                <div className="filter-group">
                  <h3>Gender</h3>
                  <select
                    name="gender"
                    className="filter-select"
                    value={filters.gender}
                    onChange={handleGenderChange}
                  >
                    <option value="">All</option>
                    <option value="mens">Men's</option>
                    <option value="womens">Women's</option>
                    <option value="childrens">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              )}

              {searchType === 'services' && (
                <>
                  <div className="filter-group">
                    <h3>Service Type</h3>
                    <select
                      name="serviceType"
                      className="filter-select"
                      value={filters.serviceType}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Types</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="cafe">Cafe</option>
                      <option value="catering">Catering</option>
                      <option value="salon">Salon</option>
                      <option value="spa">Spa</option>
                      <option value="parlour">Parlour</option>
                      <option value="clinic">Clinic</option>
                      <option value="dental">Dental</option>
                      <option value="hotel">Hotel</option>
                      <option value="guest-house">Guest House</option>
                      <option value="gym">Gym</option>
                      <option value="yoga">Yoga</option>
                      <option value="tutoring">Tutoring</option>
                      <option value="photography">Photography</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="laundry">Laundry</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <h3>Booking</h3>
                    <select
                      name="bookingRequired"
                      className="filter-select"
                      value={filters.bookingRequired}
                      onChange={handleFilterChange}
                    >
                      <option value="">All</option>
                      <option value="true">Booking Required</option>
                      <option value="false">Walk-in OK</option>
                    </select>
                  </div>
                </>
              )}

              {(searchType === 'products' || searchType === 'services') && <div className="filter-group">
                <h3>Price Range</h3>
                <div className="price-range-slider">
                  <Slider
                    value={priceRange}
                    onChange={handlePriceChange}
                    onChangeCommitted={handlePriceChangeCommitted}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000}
                    step={100}
                    valueLabelFormat={(value) => `₹${value}`}
                  />
                  <div className="price-range-labels">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>}

              <div className="filter-group">
                <h3>Sort By</h3>
                <select
                  name="sortBy"
                  className="filter-select"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="">Relevance</option>
                  {searchType === 'products' ? (
                    <>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </>
                  ) : (
                    <>
                      <option value="rating">Rating</option>
                      <option value="reviews">Most Reviews</option>
                      <option value="distance">Distance</option>
                    </>
                  )}
                </select>
              </div>

              {/* Radius Filter — only shown when user has location */}
              <div className="filter-group radius-filter-group">
                <div className="radius-filter-header">
                  <h3>
                    {radiusEnabled ? <MyLocation fontSize="small" /> : <LocationOff fontSize="small" />}
                    Search Area
                  </h3>
                  <button
                    type="button"
                    className={`radius-mode-toggle ${!radiusEnabled ? 'city-mode' : ''}`}
                    onClick={() => { setRadiusEnabled(r => !r); setCurrentPage(1); }}
                  >
                    {radiusEnabled ? 'Near Me' : 'By City'}
                  </button>
                </div>

                {radiusEnabled ? (
                  userLocation?.coordinates ? (
                    <>
                      <div className="radius-value-display">
                        <span className="radius-km">{searchRadius} km</span>
                        <span className="radius-label">from your location</span>
                      </div>
                      <div className="radius-slider-wrap">
                        <Slider
                          value={searchRadius}
                          onChange={(_e, v) => setSearchRadius(v as number)}
                          onChangeCommitted={() => setCurrentPage(1)}
                          min={2}
                          max={100}
                          step={1}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(v) => `${v} km`}
                        />
                        <div className="radius-slider-labels">
                          <span>2 km</span>
                          <span>100 km</span>
                        </div>
                      </div>
                      <div className="radius-presets">
                        {[5, 10, 15, 25, 50].map(r => (
                          <button
                            key={r}
                            type="button"
                            className={`radius-preset-chip ${searchRadius === r ? 'active' : ''}`}
                            onClick={() => { setSearchRadius(r); setCurrentPage(1); }}
                          >
                            {r} km
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="radius-no-location">
                      <LocationOff fontSize="small" /> Location not available. Allow location access or switch to City mode.
                    </p>
                  )
                ) : (
                  <div className="city-search-input-wrap">
                    <LocationOn fontSize="small" className="city-input-icon" />
                    <input
                      type="text"
                      className="city-search-input"
                      placeholder="Enter city name..."
                      value={citySearch}
                      onChange={(e) => { setCitySearch(e.target.value); setCurrentPage(1); }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="search-results-container">
          {/* Debug info - only show in development */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="debug-panel">
              <strong>Debug Info</strong>
              <div className="debug-panel-content">
                Search Type: {searchType}<br/>
                Loading: {loading.toString()}<br/>
                Category Param: {catogoryParams.category}<br/>
                Current Page: {currentPage}<br/>
                Items Per Page: {itemsPerPage}<br/>
                Shops Count: {searchResults.shops?.length || 0}<br/>
                Products Count: {searchResults.products?.length || 0}<br/>
                Pagination: {pagination ? `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total)` : 'No pagination info'}<br/>
                {searchResults.shops?.length > 0 && (
                  <>First Shop: {JSON.stringify(searchResults.shops[0], null, 2)}<br/></>
                )}
                {searchResults.products?.length > 0 && (
                  <>First Product: {JSON.stringify(searchResults.products[0], null, 2)}<br/></>
                )}
              </div>
              <div className="debug-buttons">
                <button 
                  className="debug-button"
                  onClick={async () => {
                    try {
                      console.log('Testing API calls...');
                      const shopResponse = await searchShops('page=1&limit=5');
                      const productResponse = await searchProducts('page=1&limit=5');
                      console.log('Shop API response:', shopResponse);
                      console.log('Product API response:', productResponse);
                      
                      // Test both formats
                      if (Array.isArray(shopResponse)) {
                        console.log('Shop API returns array format (old)');
                      } else if (shopResponse?.data) {
                        console.log('Shop API returns paginated format (new)');
                        console.log('Shop pagination:', shopResponse.pagination);
                      }
                      
                      if (Array.isArray(productResponse)) {
                        console.log('Product API returns array format (old)');
                      } else if (productResponse?.data) {
                        console.log('Product API returns paginated format (new)');
                        console.log('Product pagination:', productResponse.pagination);
                      }
                      
                      toast.success('API test completed - check console');
                    } catch (error) {
                      console.error('API test failed:', error);
                      toast.error('API test failed - check console');
                    }
                  }}
                >
                  Test API
                </button>
                <button 
                  className="debug-button"
                  onClick={() => {
                    setSearchResults({ shops: [], products: [], services: [] });
                    toast.info('Search results cleared');
                  }}
                >
                  Clear Results
                </button>
              </div>
            </div>
          )} */}
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : searchType === 'shops' ? (
            Array.isArray(searchResults.shops) &&
            searchResults.shops.filter(
              (shop) => shop && shop.isDeleted !== true && shop.isActive !== false
            ).length > 0 ? (
              searchResults.shops
                .filter(
                  (shop) => shop && shop.isDeleted !== true && shop.isActive !== false
                )
                .map((shop) => (
                <div key={shop._id} className="shop-card-search">
                  <div 
                    className="shop-favorite-search"
                    onClick={(e) => {
                      e.preventDefault();
                      handleWishlist(shop._id, 'shop');
                    }}
                  >
                    {wishlistData.shops.includes(shop._id) ? (
                      <Favorite className="favorited" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </div>
                  <Link to={`/shop/${shop._id}`}>
                    <SafeImage
                      src={shop.images?.[0]}
                      alt={shop.name}
                      className="shop-image-search"
                      preset="CARD"
                    />
                    <div className="shop-info-search">
                      <h3>{shop.name}</h3>
                      {(shop.reviewCount ?? 0) > 0 && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0 0 0.3rem 0' }}>
                          <StarRating value={shop.rating || 0} size={14} />
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {(shop.rating || 0).toFixed(1)} ({shop.reviewCount})
                          </span>
                        </p>
                      )}
                      <p>{shop.category?.name || 'No category'}</p>
                      <p>{shop.address ? `${shop.address.city}, ${shop.address.state}` : 'No address'}</p>
                      <p className="shop-distance">
                        <LocationOn className="distance-icon" />
                        {getShopDistance(shop)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-results">No shops found</div>
            )
          ) : searchType === 'services' ? (
            Array.isArray(searchResults.services) &&
            searchResults.services.filter(
              (s) => s && s.isDeleted !== true && s.isActive !== false
            ).length > 0 ? (
              searchResults.services
                .filter((s) => s && s.isDeleted !== true && s.isActive !== false)
                .map((service) => {
                  const priceLabelMap: Record<string, string> = {
                    fixed: '',
                    starting_from: 'Starting from',
                    per_hour: '/ hr',
                    per_night: '/ night',
                    per_session: '/ session',
                    per_person: '/ person'
                  };
                  const priceLabel = priceLabelMap[service.priceType] || '';
                  return (
                    <div key={service._id} className="service-card-search">
                      <Link to={`/serviceDetails/${service._id}`}>
                        <SafeImage
                          src={service.images?.[0]}
                          alt={service.name}
                          className="service-image-search"
                          preset="CARD"
                        />
                        {service.bookingRequired && (
                          <span className="service-booking-tag">
                            <EventAvailable fontSize="small" /> Book
                          </span>
                        )}
                        <div className="service-info-search">
                          <span className="service-type-mini">{service.serviceType?.replace('-', ' ')}</span>
                          <h3>{service.name}</h3>
                          {(service.reviewCount ?? 0) > 0 && (
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0 0 0.3rem 0' }}>
                              <StarRating value={service.rating || 0} size={14} />
                              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                {(service.rating || 0).toFixed(1)} ({service.reviewCount})
                              </span>
                            </p>
                          )}
                          <div style={{ margin: '0 0 0.4rem 0' }}>
                            <PriceDisplay
                              price={service.price}
                              mrp={service.mrp}
                              variant="card"
                              suffix={service.priceType !== 'fixed' && service.priceType !== 'starting_from' ? priceLabel : undefined}
                            />
                          </div>
                          {service.duration && (
                            <p className="service-duration-mini">
                              <Schedule fontSize="small" /> {service.duration}
                            </p>
                          )}
                          <p className="service-shop-mini">
                            {typeof service.shopId === 'object' ? service.shopId?.name : ''}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })
            ) : (
              <div className="no-results">No services found</div>
            )
          ) : Array.isArray(searchResults.products) &&
            searchResults.products.filter(
              (product) =>
                product && product.isDeleted !== true && product.isActive !== false
            ).length > 0 ? (
            searchResults.products
              .filter(
                (product) =>
                  product && product.isDeleted !== true && product.isActive !== false
              )
              .map((product) => (
              <div key={product._id} className="product-card-search">
                <div 
                  className="product-favorite-search"
                  onClick={(e) => {
                    e.preventDefault();
                    handleWishlist(product._id, 'product');
                  }}
                >
                  {wishlistData.products.includes(product._id) ? (
                    <Favorite className="favorited" />
                  ) : (
                    <FavoriteBorder />
                  )}
                </div>
                <Link to={`/productDetails/${product._id}`}>
                  <SafeImage
                    src={product.images?.[0]}
                    alt={product.name}
                    className="product-image-search"
                    preset="CARD"
                  />
                  <div className="product-info-search">
                    <h3>{product.name}</h3>
                    <div style={{ margin: '0 0 0.5rem 0' }}>
                      {(() => {
                        const variants = (product as any).variants as any[] | undefined;
                        if (Array.isArray(variants) && variants.length > 0) {
                          const prices = variants.map(v => v.price).filter(p => p > 0);
                          const mrps = variants.map(v => v.mrp).filter((m: number) => m > 0);
                          const minPrice = Math.min(...prices);
                          const lowestMrp = mrps.length ? Math.min(...mrps) : null;
                          return (
                            <>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: 2 }}>From</span>
                              <PriceDisplay price={minPrice} mrp={lowestMrp} variant="card" />
                            </>
                          );
                        }
                        return <PriceDisplay price={product.price} mrp={(product as any).mrp} variant="card" />;
                      })()}
                    </div>
                    <div style={{ margin: '0 0 0.4rem 0' }}>
                      <StockBadge stock={product.stock} isAvailable={product.isAvailable} />
                    </div>
                    {(product.reviewCount ?? 0) > 0 && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0 0 0.3rem 0' }}>
                        <StarRating value={product.rating || 0} size={14} />
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {(product.rating || 0).toFixed(1)} ({product.reviewCount})
                        </span>
                      </p>
                    )}
                    <p className="product-shop">{product.shop?.name || 'Unknown Shop'}</p>
                    <p className="product-category">{product.category?.name || 'No category'}</p>
                    <p className="product-gender">{product.genderCategory || 'No gender'}</p>
                    <p className="product-distance">
                      <LocationOn className="distance-icon" />
                      Distance unavailable
                    </p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-results">No products found</div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
              >
                ← Previous
              </button>
              
              <div className="pagination-pages">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust start page if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  // Add first page and ellipsis if needed
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        className="pagination-button"
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
                    }
                  }
                  
                  // Add visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`pagination-button ${i === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Add ellipsis and last page if needed
                  if (endPage < pagination.totalPages) {
                    if (endPage < pagination.totalPages - 1) {
                      pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
                    }
                    pages.push(
                      <button
                        key={pagination.totalPages}
                        className="pagination-button"
                        onClick={() => setCurrentPage(pagination.totalPages)}
                      >
                        {pagination.totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
              </div>
              
              <button 
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
              >
                Next →
              </button>
              
              <div className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} results
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Ads */}
      <div className="vertical-ads">
        <div className="vertical-ads-container">
          {visibleRightAds.length > 0 ? (
            visibleRightAds.map((ad) => (
              <a 
                key={ad._id}
                href={ad.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="vertical-ad-card"
              >
                <SafeImage
                  src={ad.images?.[0]}
                  alt={ad.title || 'Promotion'}
                  className="vertical-ad-image"
                  preset="AD"
                />
                <div className="vertical-ad-content">
                  <div>
                    <h3>{ad.title}</h3>
                    <p>{ad.description}</p>
                  </div>
                  <div className="vertical-ad-location">
                    <LocationOn />
                    <span>
                      {ad.targeting?.targetType === 'GLOBAL' 
                        ? 'Available Everywhere'
                        : ad.targeting?.targetType === 'STATE'
                        ? `Available in ${ad.targeting?.state || ''}`
                        : `Available in ${ad.targeting?.city || ''}`}
                    </span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="no-ads">No advertisements available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
