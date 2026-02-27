import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './searchPage.css';
import { Search, FilterList, Favorite, FavoriteBorder, Store, ShoppingBag, LocationOn } from '@mui/icons-material';
import { searchShops, searchProducts, addToWishlist, removeFromWishlist, getWishlist, getAdvertisementNearby, getCategories } from '../../Api';
import { toast } from 'react-toastify';
import { Slider } from '@mui/material';
import { calculateDistance, formatDistance } from '../../utils/distance';

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
  isActive?: boolean;
  isDeleted?: boolean;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  shop: {
    name: string;
  };
  category: {
    name: string;
  };
  genderCategory: string;
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

interface SearchResults {
  shops: Shop[];
  products: Product[];
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
  const [searchType, setSearchType] = useState<'shops' | 'products'>('shops');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    shops: [],
    products: []
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
    sortBy: ''
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

  // Separate useEffect for fetching ads when userLocation changes
  useEffect(() => {
    fetchAdvertisements();
  }, [userLocation]);

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

      const leftColumn: Advertisement[] = [];
      const rightColumn: Advertisement[] = [];
      activeAds.forEach((ad, index) => {
        if (index % 2 === 0) leftColumn.push(ad);
        else rightColumn.push(ad);
      });

      setLeftAds(leftColumn);
      setRightAds(rightColumn);
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

    if (!searchQuery.trim() && !filters.category && !filters.gender && !filters.minPrice && !filters.maxPrice) {
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
      } else {
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
      }
    } catch (error: any) {
      console.error('Search error:', error);
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 3000.');
      } else {
        toast.error('Failed to fetch search results');
      }
      // Set empty results on error
      setSearchResults({ shops: [], products: [] });
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
    // Reset to page 1 when filters change
    setCurrentPage(1);
    // Trigger search when filters change
    handleSearch();
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFilters(prev => ({
      ...prev,
      gender: value
    }));
    // Reset to page 1 when gender changes
    setCurrentPage(1);
    // Trigger search when gender changes
    handleSearch();
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

      const baseQuery = catogoryParams.category === 'all' ? '' : `category=${catogoryParams.category}`;
      const queryString = baseQuery + (baseQuery ? '&' : '') + `page=${currentPage}&limit=${itemsPerPage}`;
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
        } else {
          setSearchResults(prev => ({ ...prev, products: [] }));
        }
      }
    };

    performInitialSearch();
  }, [searchType, catogoryParams.category, currentPage, itemsPerPage]);

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
                <img 
                  src={ad.images?.[0] || 'https://via.placeholder.com/300x400?text=Promo'} 
                  alt={ad.title || 'Promotion'} 
                  className="vertical-ad-image"
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

              {searchType === 'products' && <div className="filter-group">
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
                    setSearchResults({ shops: [], products: [] });
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
                    <img 
                      src={shop.images?.[0] || 'https://via.placeholder.com/300'} 
                      alt={shop.name} 
                      className="shop-image-search" 
                    />
                    <div className="shop-info-search">
                      <h3>{shop.name}</h3>
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
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/300'} 
                    alt={product.name} 
                    className="product-image-search" 
                  />
                  <div className="product-info-search">
                    <h3>{product.name}</h3>
                    <p className="product-price">₹{product.price}</p>
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
                <img 
                  src={ad.images?.[0] || 'https://via.placeholder.com/300x400?text=Promo'} 
                  alt={ad.title || 'Promotion'} 
                  className="vertical-ad-image"
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
