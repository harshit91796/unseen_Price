import React, { useState, useEffect, useRef } from 'react';
import './profile.css';
import { Edit, AccessTime, LocationOn, Phone, Category, Store, Delete, RoomService, Schedule, EventAvailable } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
// import { shopeImages } from '../../Pictures';
import { getShopDetails, getShopProducts, getShopServices, updateShop, updateProduct, updateService, getAdvertisementNearby } from '../../Api';
import InlineAdCard from '../../components/InlineAdCard/InlineAdCard';
import { filterByFrequencyCap, recordImpressions, dismissAd } from '../../utils/adFrequency';
import ShopEditModal from './edit modal/shopEditModal';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { toast } from 'react-toastify';
import { Slider } from '@mui/material';
import { useSelector } from 'react-redux';
import ReportButton from '../../components/ReportButton/ReportButton';
import SafeImage from '../../components/SafeImage/SafeImage';
import ReviewSection from '../../components/Reviews/ReviewSection';
import StarRating from '../../components/Reviews/StarRating';
import ShareButton from '../../components/ShareButton/ShareButton';
import PriceDisplay from '../../components/Price/PriceDisplay';
import StockBadge from '../../components/Price/StockBadge';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Profile = () => {
  const currentUser = useSelector((state: any) => state.user);
  const { shopId } = useParams();
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [shopServices, setShopServices] = useState<any[]>([]);
  // "Similar businesses nearby" ad row shown at the bottom of the profile
  const [nearbyAds, setNearbyAds] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('mens');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [itemsPerPage] = useState(12); // Show 12 products per page
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
    isOpen: false,
    productId: null,
    productName: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await ShopDetails();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!shopDetails) return;
    const loadInventory = async () => {
      if (shopDetails.type === 'service') {
        await ShopServices();
      } else {
        await ShopProducts(currentPage);
      }
    };
    loadInventory();
  }, [shopDetails, currentPage]);

  // Fetch "similar businesses nearby" ads using the shop's own location + category
  useEffect(() => {
    if (!shopDetails?.targeting?.coordinates || !shopDetails?.address?.state) return;
    (async () => {
      try {
        const ads = await getAdvertisementNearby({
          longitude: shopDetails.targeting.coordinates[0],
          latitude: shopDetails.targeting.coordinates[1],
          state: shopDetails.address.state,
          city: shopDetails.address.city,
          category: shopDetails.category?.name
        });
        const valid = (Array.isArray(ads) ? ads : []).filter((a: any) => {
          if (!a) return false;
          if (a._id === shopDetails._id) return false; // never show the shop's own ad on its own page
          const active = a.isActive && !a.isDeleted;
          const inDate =
            (!a.startDate || new Date(a.startDate) <= new Date()) &&
            (!a.endDate || new Date(a.endDate) >= new Date());
          return active && inDate;
        });
        const capped = filterByFrequencyCap(valid);
        const finalAds = capped.length > 0 ? capped : valid;
        setNearbyAds(finalAds.slice(0, 3));
      } catch (e) {
        console.error('Failed to load nearby ads on shop profile:', e);
        setNearbyAds([]);
      }
    })();
  }, [shopDetails?._id]);

  // Record impression for the ad slots we actually rendered
  useEffect(() => {
    if (nearbyAds.length > 0) recordImpressions(nearbyAds);
  }, [nearbyAds]);

  const ShopDetails = async () => {
    try {
      const response = await getShopDetails(shopId as string);
      console.log('Shop details response:', response);
      setShopDetails(response);
    } catch (error) {
      console.error('Error fetching shop details:', error);
      toast.error('Failed to load shop details');
    }
  }

  const ShopProducts = async (page: number = 1) => {
    try {
      // For now, we'll modify the API call to include pagination parameters
      // You might need to update the getShopProducts function in Api.ts to accept page and limit
      const response = await getShopProducts(shopId as string);
      console.log('Shop products response:', response);
      
      // Handle both old format (array) and new format (paginated object)
      let products = [];
      let paginationInfo: PaginationInfo | null = null;
      
      if (Array.isArray(response)) {
        // Old format - direct array, we'll implement client-side pagination
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        products = response.slice(startIndex, endIndex);
        
        // Create pagination info for client-side pagination
        paginationInfo = {
          page: page,
          limit: itemsPerPage,
          total: response.length,
          totalPages: Math.ceil(response.length / itemsPerPage),
          hasNextPage: endIndex < response.length,
          hasPrevPage: page > 1
        };
        
        // Store all products for filtering
        setShopProducts(response);
      } else if (response?.data && Array.isArray(response.data)) {
        // New format - paginated response from server
        products = response.data;
        paginationInfo = response.pagination;
        setShopProducts(response.data);
      } else {
        console.error('Shop products response is not an array:', response);
        products = [];
        setShopProducts([]);
      }
      
      console.log('Processed shop products:', products);
      console.log('Pagination info:', paginationInfo);
      setPagination(paginationInfo);
      
    } catch (error) {
      console.error('Error fetching shop products:', error);
      setShopProducts([]);
      setPagination(null);
      toast.error('Failed to load shop products');
    }
  }

  const ShopServices = async () => {
    try {
      const response = await getShopServices(shopId as string);
      let services: any[] = [];
      if (Array.isArray(response)) {
        services = response;
      } else if (response?.data && Array.isArray(response.data)) {
        services = response.data;
      }
      setShopServices(services);
    } catch (error) {
      console.error('Error fetching shop services:', error);
      setShopServices([]);
      toast.error('Failed to load services');
    }
  };

  useEffect(() => {
    if (!loading && shopProducts.length > 0) {
      filteredProduct();
    }
  }, [activeTab, activeFilter, priceRange, shopProducts, loading]);

  // Filter services based on activeFilter (serviceType) and priceRange
  useEffect(() => {
    if (!shopServices) return;
    const isOwner = currentUser?.user?._id === shopDetails?.owner;
    let filtered = shopServices.filter((s: any) => {
      if (s.isDeleted === true) return false;
      // Owner can see flagged/inactive listings (with warning banner). Public can't.
      if (s.isActive === false && !isOwner) return false;
      if (activeFilter !== 'All' && s.serviceType !== activeFilter) return false;
      const price = Number(s.price);
      if (showPriceFilter && (price < priceRange[0] || price > priceRange[1])) return false;
      return true;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredServices(filtered.slice(startIndex, endIndex));

    setPagination({
      page: currentPage,
      limit: itemsPerPage,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      hasNextPage: endIndex < filtered.length,
      hasPrevPage: currentPage > 1
    });
  }, [shopServices, activeFilter, priceRange, showPriceFilter, currentPage]);

  const filteredProduct = () => {
    if (!shopProducts || !Array.isArray(shopProducts)) {
      console.log('shopProducts is not an array:', shopProducts);
      setFilteredProducts([]);
      return;
    }
    
    // Apply filters to all products (exclude deleted; keep inactive only for owner so they see flagged items)
    const isOwner = currentUser?.user?._id === shopDetails?.owner;
    let allFilteredProducts = shopProducts.filter((product: any) => {
      if (product.isDeleted === true) return false;
      if (product.isActive === false && !isOwner) return false;

      if (activeTab === 'mens' && product.genderCategory !== 'mens') return false;
      if (activeTab === 'womens' && product.genderCategory !== 'womens') return false;
      if (activeTab === 'childrens' && product.genderCategory !== 'childrens') return false;
      if (activeTab === 'extra' && product.genderCategory !== 'extra') return false;

      if (activeFilter !== 'All' && product.productCategory !== activeFilter) {
        return false;
      }

      const price = Number(product.price);
      if (price < priceRange[0] || price > priceRange[1] && showPriceFilter) return false;
      
      return true;
    });
    
    // Apply client-side pagination to filtered results
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = allFilteredProducts.slice(startIndex, endIndex);
    
    // Update pagination info based on filtered results
    const filteredPagination: PaginationInfo = {
      page: currentPage,
      limit: itemsPerPage,
      total: allFilteredProducts.length,
      totalPages: Math.ceil(allFilteredProducts.length / itemsPerPage),
      hasNextPage: endIndex < allFilteredProducts.length,
      hasPrevPage: currentPage > 1
    };
    
    setFilteredProducts(paginatedProducts);
    setPagination(filteredPagination);
    console.log('Filtered products:', paginatedProducts);
    console.log('Updated pagination:', filteredPagination);
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pos = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartPos(pos);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentPosition = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const currentOffset = currentPosition - startPos;
    const translate = prevTranslate + currentOffset;
    
    setCurrentTranslate(translate);
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(${translate}px)`;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const movedBy = currentTranslate - prevTranslate;
    
    if (Math.abs(movedBy) > 100 && shopDetails?.images) {
      if (movedBy > 0 && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (movedBy < 0 && currentImageIndex < shopDetails.images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    }

    // Reset to proper position
    if (sliderRef.current && shopDetails?.images) {
      const newTranslate = -(currentImageIndex * sliderRef.current.offsetWidth);
      sliderRef.current.style.transform = `translateX(${newTranslate}px)`;
      setCurrentTranslate(newTranslate);
      setPrevTranslate(newTranslate);
    }
  };

  useEffect(() => {
    // Update transform when currentImageIndex changes
    if (sliderRef.current && shopDetails?.images) {
      const newTranslate = -(currentImageIndex * sliderRef.current.offsetWidth);
      sliderRef.current.style.transform = `translateX(${newTranslate}px)`;
      setCurrentTranslate(newTranslate);
      setPrevTranslate(newTranslate);
    }
  }, [currentImageIndex]);

  const handleUpdateShop = async (updatedData: any) => {
    try {
      // Call your API to update shop details
      await updateShop(shopId as string, updatedData);
      await ShopDetails(); // Refresh shop details
    } catch (error) {
      toast.error('Failed to update shop details');
    }
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
    setCurrentPage(1); // Reset to first page when price changes
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when tab changes
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmModal.productId) return;

    try {
      if (shopDetails?.type === 'service') {
        await updateService(deleteConfirmModal.productId, { isDeleted: true });
        toast.success('Service deleted successfully');
        await ShopServices();
      } else {
        await updateProduct(deleteConfirmModal.productId, { isDeleted: true });
        toast.success('Product deleted successfully');
        await ShopProducts(currentPage);
      }
      setDeleteConfirmModal({ isOpen: false, productId: null, productName: '' });
    } catch (error) {
      console.error('Failed to delete', error);
      toast.error('Failed to delete');
    }
  };

  const openDeleteConfirm = (productId: string, productName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, productId, productName });
  };

  const isOwner = currentUser?.user?._id === shopDetails?.owner;
  const shopFlagged = shopDetails && (shopDetails.moderationStatus === 'flagged' || shopDetails.isActive === false);

  return (
    <div className="shop-details-container container">
      {/* Owner-only banner: shop has been flagged by admin */}
      {isOwner && shopFlagged && (
        <div className="shop-flagged-banner">
          <strong>⚠ Your business is hidden from public view</strong>
          <p>
            Our team flagged this listing for violating content guidelines. Customers can't find it in search.
            Please <a href="/legal/terms" target="_blank" rel="noopener noreferrer">review the guidelines</a> and
            contact support if you believe this was a mistake. You cannot reactivate it yourself — only the moderation team can.
          </p>
        </div>
      )}

      {/* Shop Header */}
      <section className="shop-header">
        <div className="shop-header-content">
          <div className="shop-image-container"
               onMouseDown={handleDragStart}
               onMouseMove={handleDragMove}
               onMouseUp={handleDragEnd}
               onMouseLeave={handleDragEnd}
               onTouchStart={handleDragStart}
               onTouchMove={handleDragMove}
               onTouchEnd={handleDragEnd}>
            {shopDetails?.images && shopDetails.images.length > 0 && (
              <>
                <div className="image-slider" ref={sliderRef}>
                  {shopDetails.images.map((image: string, index: number) => (
                    <div key={index} className="slide">
                      <SafeImage
                        src={image}
                        alt={`${shopDetails.name} view ${index + 1}`}
                        className="shop-image"
                        draggable="false"
                        preset="HERO"
                        lazy={index !== 0}
                      />
                    </div>
                  ))}
                </div>
                <div className="image-indicators">
                  {shopDetails.images.map((_: any, index: number) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="shop-info">
            <div className="shop-info-header">
              <h1>{shopDetails?.name || 'Loading...'}</h1>
              {currentUser?.user?._id === shopDetails?.owner ? (
                <button
                  className='edit-button'
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit shop details"
                >
                  <Edit />
                </button>
              ) : null}
              {shopDetails?._id && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <ShareButton
                    title={shopDetails.name}
                    subtitle={shopDetails.category?.name}
                  />
                  {currentUser?.user?._id !== shopDetails?.owner && (
                    <ReportButton targetType="shop" targetId={shopDetails._id} variant="text" />
                  )}
                </div>
              )}
            </div>
            {shopDetails?.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <StarRating value={shopDetails.rating || 0} size={18} />
                <span style={{ fontWeight: 600 }}>{(shopDetails.rating || 0).toFixed(1)}</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  ({shopDetails.reviewCount} review{shopDetails.reviewCount > 1 ? 's' : ''})
                </span>
              </div>
            )}
            <div className="shop-info-details">
              {(() => {
                const addr = shopDetails?.address;
                const coords = shopDetails?.targeting?.coordinates;
                const fullAddress = addr
                  ? [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ')
                  : '';
                // Prefer coordinates for accuracy, fall back to address string
                let mapsUrl: string | null = null;
                if (Array.isArray(coords) && coords.length === 2 && (coords[0] || coords[1])) {
                  mapsUrl = `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;
                } else if (fullAddress) {
                  mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
                }
                const displayLocation = addr?.city
                  ? `${addr.city}${addr.state ? ', ' + addr.state : ''}`
                  : 'Location not available';
                return (
                  <p className="shop-detail-row">
                    <LocationOn className="shop-detail-icon" />
                    {mapsUrl ? (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="shop-detail-link" title="Open in Google Maps">
                        {displayLocation}
                      </a>
                    ) : (
                      <span>{displayLocation}</span>
                    )}
                  </p>
                );
              })()}

              {(() => {
                const phone = shopDetails?.contact?.phone || (typeof shopDetails?.contact === 'string' ? shopDetails.contact : '');
                const email = shopDetails?.contact?.email;
                const display = phone || email || 'Contact not available';
                const isPhone = !!phone;
                const isEmail = !phone && !!email;
                return (
                  <p className="shop-detail-row">
                    <Phone className="shop-detail-icon" />
                    {isPhone ? (
                      <a href={`tel:${phone.replace(/\s+/g, '')}`} className="shop-detail-link" title="Call">{display}</a>
                    ) : isEmail ? (
                      <a href={`mailto:${email}`} className="shop-detail-link" title="Email">{display}</a>
                    ) : (
                      <span>{display}</span>
                    )}
                  </p>
                );
              })()}

              <p className="shop-detail-row">
                <AccessTime className="shop-detail-icon" />
                <span>{shopDetails?.openTime} to {shopDetails?.closeTime}</span>
              </p>
              <p className="shop-detail-row">
                <Category className="shop-detail-icon" />
                <span>{shopDetails?.category?.name}</span>
              </p>
              <p className="shop-detail-row">
                {shopDetails?.type === 'service' ? <RoomService className="shop-detail-icon" /> : <Store className="shop-detail-icon" />}
                <span>Type: <span className="status-open">{shopDetails?.type === 'service' ? 'Service' : 'Shop'}</span></span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs and Filters */}
      <section className="shop-navigation">
        <div className="tabs">
          {shopDetails?.type !== 'service' && (
            <div className='tab-buttons'>
              {['mens', 'womens', 'childrens','extra'].map((tab) => (
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="filters">
            <div className='filter-group'>
              <div className='category-filter'>
                <select
                  className='filter-select'
                  value={activeFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="All">{shopDetails?.type === 'service' ? 'All Services' : 'All Categories'}</option>
                  {shopDetails?.type === 'service'
                    ? shopDetails?.serviceCategories?.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    : shopDetails?.productCategories?.map((category: any) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                </select>
              </div>
              <div className='price-filter'>
                <button
                  className='price-filter-button'
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                >
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                </button>
                {showPriceFilter && (
                  <div className='price-slider-container'>
                    <Slider
                      value={priceRange}
                      onChange={handlePriceChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={500000}
                      step={100}
                      sx={{
                        width: '200px',
                        color: 'var(--primary-color)',
                        '& .MuiSlider-thumb': {
                          backgroundColor: '#fff',
                          border: '2px solid var(--primary-color)',
                        },
                        '& .MuiSlider-valueLabel': {
                          backgroundColor: 'var(--primary-color)',
                        }
                      }}
                    />
                    <div className='price-range-labels'>
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {currentUser?.user?._id === shopDetails?.owner && (
              <Link
                to={shopDetails?.type === 'service' ? `/add-service/${shopId}` : `/add-product/${shopId}`}
                className='add-product-link'
              >
                <button className='add-product-button'>
                  {shopDetails?.type === 'service' ? 'Add Service' : 'Add Product'}
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="products-section">
        {/* Debug info - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            padding: '10px', 
            background: '#f0f0f0', 
            margin: '10px 0', 
            fontSize: '12px',
            borderRadius: '8px'
          }}>
            <strong>Debug Info:</strong><br/>
            Loading: {loading.toString()}<br/>
            Shop Products Type: {typeof shopProducts}<br/>
            Shop Products Is Array: {Array.isArray(shopProducts).toString()}<br/>
            Shop Products Length: {Array.isArray(shopProducts) ? shopProducts.length : 'N/A'}<br/>
            Filtered Products Length: {filteredProducts.length}<br/>
            Current Page: {currentPage}<br/>
            Items Per Page: {itemsPerPage}<br/>
            Active Tab: {activeTab}<br/>
            Active Filter: {activeFilter}<br/>
            Pagination: {pagination ? `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total)` : 'No pagination info'}<br/>
            {shopProducts.length > 0 && (
              <>First Product: {JSON.stringify(shopProducts[0], null, 2)}<br/></>
            )}
          </div>
        )}
        
        <div className="product-grid">
          {loading ? (
            <div className="loading">
              <h3>Loading {shopDetails?.type === 'service' ? 'services' : 'products'}...</h3>
            </div>
          ) : shopDetails?.type === 'service' ? (
            filteredServices?.length === 0 ? (
              <div className="no-products">
                <h3>No services found</h3>
                <p>
                  {shopServices.length === 0
                    ? 'This business has no services listed yet. Add some services to get started!'
                    : 'Try adjusting your filters to see more services'
                  }
                </p>
              </div>
            ) : (
              filteredServices.map((service: any) => {
                const priceLabelMap: Record<string, string> = {
                  fixed: '',
                  starting_from: 'Starting from',
                  per_hour: '/ hr',
                  per_night: '/ night',
                  per_session: '/ session',
                  per_person: '/ person'
                };
                const label = priceLabelMap[service.priceType] || '';
                const isFlagged = service.moderationStatus === 'flagged' || service.isActive === false;
                return (
                  <div key={service._id} className={`product-card-wrapper ${isFlagged ? 'flagged-card' : ''}`}>
                    {isFlagged && (
                      <div className="flagged-banner">
                        <strong>⚠ Hidden from public</strong>
                        <p>This service was flagged by our team and is no longer visible to users. <a href="/legal/terms" target="_blank" rel="noopener noreferrer">Read content guidelines</a> to fix the issue, then contact support.</p>
                      </div>
                    )}
                    <Link to={`/serviceDetails/${service._id}`} className="product-card">
                      <div className="product-image-container">
                        <SafeImage
                          src={service.images?.[0]}
                          alt={service.name}
                          className="product-image"
                          preset="CARD"
                        />
                        {service.bookingRequired && (
                          <span style={{
                            position: 'absolute', top: 8, left: 8,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white', padding: '0.2rem 0.55rem', borderRadius: '12px',
                            fontSize: '0.7rem', fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                          }}>
                            <EventAvailable fontSize="small" /> Book
                          </span>
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{service.name}</h3>
                        <div style={{ margin: '0.3rem 0' }}>
                          <PriceDisplay
                            price={service.price}
                            mrp={service.mrp}
                            variant="card"
                            suffix={service.priceType !== 'fixed' && service.priceType !== 'starting_from' ? label : undefined}
                          />
                        </div>
                        {service.duration && (
                          <p style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Schedule fontSize="small" /> {service.duration}
                          </p>
                        )}
                      </div>
                    </Link>
                    {currentUser?.user?._id === shopDetails?.owner && (
                      <button
                        className="product-delete-button"
                        onClick={(e) => openDeleteConfirm(service._id, service.name, e)}
                        aria-label={`Delete ${service.name}`}
                      >
                        <Delete />
                      </button>
                    )}
                  </div>
                );
              })
            )
          ) : filteredProducts?.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>
                {shopProducts.length === 0
                  ? 'This shop has no products yet. Add some products to get started!'
                  : 'Try adjusting your filters to see more products'
                }
              </p>
            </div>
          ) : (
            filteredProducts?.map((product: any) => {
              const isFlagged = product.moderationStatus === 'flagged' || product.isActive === false;
              return (
                <div key={product._id} className={`product-card-wrapper ${isFlagged ? 'flagged-card' : ''}`}>
                  {isFlagged && (
                    <div className="flagged-banner">
                      <strong>⚠ Hidden from public</strong>
                      <p>This product was flagged by our team and is no longer visible to users. <a href="/legal/terms" target="_blank" rel="noopener noreferrer">Read content guidelines</a> to fix the issue, then contact support.</p>
                    </div>
                  )}
                  <Link
                    to={`/productDetails/${product._id}`}
                    className="product-card"
                  >
                    <div className="product-image-container">
                      <SafeImage
                        src={product.images[0]}
                        alt={product.name}
                        className="product-image"
                        preset="CARD"
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div style={{ margin: '0.3rem 0' }}>
                        {(() => {
                          const variants = (product as any).variants as any[] | undefined;
                          if (Array.isArray(variants) && variants.length > 0) {
                            const prices = variants.map((v: any) => v.price).filter((p: number) => p > 0);
                            const mrps = variants.map((v: any) => v.mrp).filter((m: number) => m > 0);
                            const minPrice = Math.min(...prices);
                            const lowestMrp = mrps.length ? Math.min(...mrps) : null;
                            return (
                              <>
                                <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block' }}>From</span>
                                <PriceDisplay price={minPrice} mrp={lowestMrp} variant="card" />
                              </>
                            );
                          }
                          return <PriceDisplay price={product.price} mrp={product.mrp} variant="card" />;
                        })()}
                      </div>
                      <div>
                        <StockBadge stock={product.stock} isAvailable={product.isAvailable} />
                      </div>
                    </div>
                  </Link>
                  {currentUser?.user?._id === shopDetails?.owner && (
                    <button
                      className="product-delete-button"
                      onClick={(e) => openDeleteConfirm(product._id, product.name, e)}
                      aria-label={`Delete ${product.name}`}
                    >
                      <Delete />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} products
            </div>
          </div>
        )}
      </section>

      {shopDetails?._id && (
        <section style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
          <ReviewSection
            targetType="shop"
            targetId={shopDetails._id}
            averageRating={shopDetails.rating || 0}
            reviewCount={shopDetails.reviewCount || 0}
            ownerId={shopDetails.owner}
            onAggregateChanged={ShopDetails}
          />
        </section>
      )}

      {/* Similar businesses nearby — native ad row */}
      {nearbyAds.length > 0 && (
        <section className="nearby-ads-section">
          <h2 className="nearby-ads-heading">Similar businesses nearby</h2>
          <div className="nearby-ads-grid">
            {nearbyAds.map((ad) => (
              <InlineAdCard
                key={ad._id}
                ad={ad}
                variant="shop"
                onDismiss={(adId) => {
                  dismissAd(adId);
                  setNearbyAds(prev => prev.filter(x => x._id !== adId));
                }}
              />
            ))}
          </div>
        </section>
      )}

      <ShopEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shopDetails={shopDetails}
        onUpdate={handleUpdateShop}
      />

      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, productId: null, productName: '' })}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirmModal.productName}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Profile;
