import React, { useState, useEffect } from 'react';
import './ProductDetails.css';
import ImageModal from '../../components/imageModal/ImageModal';
import { 
  Star, 
  StarBorder, 
  ShoppingCart, 
  LocalShipping, 
  Verified,
  LocalOffer,
  ArrowForward,
  AddShoppingCart,
  LocationOn,
  Store
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProductDetails, getAdvertisementNearby } from '../../Api';
import { toast } from 'react-toastify';

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

const ROTATION_INTERVAL = 5000; // 5 seconds
const ADS_PER_VIEW = 3;

const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [productDetails, setProductDetails] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [visibleAds, setVisibleAds] = useState<Advertisement[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);

  useEffect(() => {
    // Get user location from localStorage
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      setUserLocation(JSON.parse(storedLocation));
    }
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
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
        setVisibleAds(activeAds.slice(0, ADS_PER_VIEW));
      } catch (error) {
        console.error('Failed to fetch advertisements:', error);
        setAdvertisements([]);
        setVisibleAds([]);
      }
    };

    fetchAds();
  }, [userLocation]);

  // Rotate ads
  useEffect(() => {
    if (advertisements.length > ADS_PER_VIEW) {
      const interval = setInterval(() => {
        setVisibleAds(prev => {
          const firstAd = advertisements[0];
          const restAds = advertisements.slice(1);
          const newAds = [...restAds, firstAd];
          setAdvertisements(newAds);
          return newAds.slice(0, ADS_PER_VIEW);
        });
      }, ROTATION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [advertisements]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProductDetails(productId as string);
        setProductDetails(data);
        setError(null);
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.warning('Please select a size');
      return;
    }
    toast.success('Added to cart successfully');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.warning('Please select a size');
      return;
    }
    // Implement buy now logic
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="error-container">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      {/* Main Product Section */}
      <div className="product-main-section">
        {/* Left Side - Images */}
        <div className="image-grid">
          {productDetails.images?.map((img: string, index: number) => (
            <img
              key={index}
              src={img}
              alt={`${productDetails.name} view ${index + 1}`}
              className="product-image"
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
        </div>

        {/* Right Side - Product Info */}
        <div className="product-info">
          <div className="product-shop-info" onClick={() => navigate(`/shop/${productDetails.shopId}`)}>
            <Store className="product-shop-icon" />
            <div className="product-shop-details">
              <h3>{productDetails.shopName}</h3>
              <span className="product-shop-rating">
                <Star className="star-filled" />
                {productDetails.shopRating || 4.5}
              </span>
            </div>
            <button className="product-visit-shop-btn">Visit Shop</button>
          </div>

          <div className="product-header">
            <h1>{productDetails.name}</h1>
            <div className="product-meta">
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= 4 ? <Star className="star-filled" /> : <StarBorder />}
                  </span>
                ))}
                <span className="review-count">(120 reviews)</span>
              </div>
              <div className="stock-status">
                <Verified className="in-stock-icon" />
                <span>In Stock</span>
              </div>
            </div>
          </div>

          <div className="product-pricing">
            <div className="price">
              <h2>₹{productDetails.price}</h2>
              {productDetails.originalPrice && (
                <span className="original-price">₹{productDetails.originalPrice}</span>
              )}
            </div>
            <div className="price-tags">
              <span className="price-tag">
                <LocalOffer /> Free Delivery
              </span>
              <span className="price-tag">
                <LocalShipping /> Fast Shipping
              </span>
            </div>
          </div>

          <div className="product-options">
            <div className="size-selection">
              <h3>Select Size</h3>
              <div className="size-grid">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >-</button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                >+</button>
              </div>
            </div>
          </div>

          <div className="product-description">
            <h3>Product Details</h3>
            <p>{productDetails.description}</p>
          </div>

          <div className="product-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleAddToCart}
            >
              <AddShoppingCart /> Add to Cart
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleBuyNow}
            >
              Buy Now <ArrowForward />
            </button>
          </div>
        </div>
      </div>

       {/* Dynamic Ads Section */}
       <section className="ads-section">
        <div className="ads-grid">
          {visibleAds.length > 0 ? (
            visibleAds.map((ad) => (
              <a 
                key={ad._id}
                href={ad.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="ad-card"
              >
                <img 
                  src={ad.images?.[0] || 'https://via.placeholder.com/400x300?text=Promo'} 
                  alt={ad.title || 'Promotion'} 
                  className="ad-image"
                />
                <div className="ad-content">
                  <div>
                    <h3>{ad.title}</h3>
                    <p>{ad.description}</p>
                  </div>
                  <div className="ad-location">
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
      </section>

      {/* Promotional Banner */}
      <div className="promo-banner">
        <div className="promo-content">
          <h3>Special Offer!</h3>
          <p>Get 10% off on your first purchase. Use code: FIRST10</p>
          <button className="promo-btn">Copy Code</button>
        </div>
      </div>

      {/* Suggestions Section */}
      <section className="suggestions-section">
        <h2>You May Also Like</h2>
        <div className="suggestions-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="suggestion-card">
              <div className="suggestion-image">
                <img src={`https://picsum.photos/400/400?random=${item}`} alt="Suggested product" />
                <span className="suggestion-tag">New</span>
              </div>
              <div className="suggestion-info">
                <h3>Suggested Product {item}</h3>
                <p className="suggestion-price">₹{Math.floor(Math.random() * 2000) + 500}</p>
                <div className="suggestion-meta">
                  <span className="suggestion-rating">★ 4.5</span>
                  <span className="suggestion-sold">Sold 120+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

     

      {/* Similar Products Section */}
      {productDetails.similarProducts && productDetails.similarProducts.length > 0 && (
        <section className="similar-products">
          <h2>Similar Products</h2>
          <div className="products-grid">
            {productDetails.similarProducts.map((product: any) => (
              <Link 
                to={`/product/${product._id}`}
                key={product._id} 
                className="product-card"
              >
                <div className="product-card-image">
                  <img src={product.images[0]} alt={product.name} />
                </div>
                <div className="product-card-info">
                  <h3>{product.name}</h3>
                  <p className="product-card-price">₹{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <ImageModal
          images={productDetails.images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
};

export default ProductDetails;
