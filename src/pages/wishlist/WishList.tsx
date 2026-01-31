import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './WishList.module.css';
import { Favorite, Store, ShoppingBag, LocationOn, StoreMallDirectory } from '@mui/icons-material';
import { getWishlist, removeFromWishlist } from '../../Api';
import { toast } from 'react-toastify';

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
}

interface WishlistData {
  products: Product[];
  shops: Shop[];
}

const WishList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');
  const [wishlistData, setWishlistData] = useState<WishlistData>({ products: [], shops: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      setWishlistData(response);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string, type: 'shop' | 'product') => {
    try {
      await removeFromWishlist(
        type === 'product' ? id : undefined,
        type === 'shop' ? id : undefined
      );
      
      setWishlistData(prev => ({
        ...prev,
        [type === 'shop' ? 'shops' : 'products']: 
          prev[type === 'shop' ? 'shops' : 'products'].filter(item => item._id !== id)
      }));
      
      toast.success(`${type === 'shop' ? 'Shop' : 'Product'} removed from wishlist`);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading your wishlist...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Favorite className={styles.titleIcon} />
          My Wishlist
        </h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'shops' ? styles.active : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            <Store className={styles.tabIcon} />
            Shops ({wishlistData.shops.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag className={styles.tabIcon} />
            Products ({wishlistData.products.length})
          </button>
        </div>
      </div>

      <div className={styles.wishlistGrid}>
        {activeTab === 'shops' ? (
          wishlistData.shops.length > 0 ? (
            wishlistData.shops.map(shop => (
              <div key={shop._id} className={styles.wishlistItem}>
                <button 
                  className={styles.removeButton} 
                  onClick={() => handleRemove(shop._id, 'shop')}
                  aria-label="Remove from wishlist"
                >
                  <Favorite />
                </button>
                <Link to={`/shop/${shop._id}`} className={styles.itemLink}>
                  <div className={styles.imageContainer}>
                    <img 
                      src={shop.images[0] || 'https://via.placeholder.com/300'} 
                      alt={shop.name} 
                      className={styles.itemImage} 
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <h3>{shop.name}</h3>
                    <p className={styles.category}>
                      <StoreMallDirectory className={styles.infoIcon} />
                      {shop.category?.name || 'General Store'}
                    </p>
                    <p className={styles.location}>
                      <LocationOn className={styles.infoIcon} />
                      {shop.address ? `${shop.address.city}, ${shop.address.state}` : 'Location not specified'}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <Store className={styles.emptyIcon} />
              <p>No shops in your wishlist yet</p>
            </div>
          )
        ) : (
          wishlistData.products.length > 0 ? (
            wishlistData.products.map(product => (
              <div key={product._id} className={styles.wishlistItem}>
                <button 
                  className={styles.removeButton} 
                  onClick={() => handleRemove(product._id, 'product')}
                  aria-label="Remove from wishlist"
                >
                  <Favorite />
                </button>
                <Link to={`/product/${product._id}`} className={styles.itemLink}>
                  <div className={styles.imageContainer}>
                    <img 
                      src={product.images[0] || 'https://via.placeholder.com/300'} 
                      alt={product.name} 
                      className={styles.itemImage} 
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <h3>{product.name}</h3>
                    <p className={styles.price}>₹{product.price}</p>
                    <p className={styles.shop}>
                      <Store className={styles.infoIcon} />
                      {product.shop?.name || 'Unknown Shop'}
                    </p>
                    <p className={styles.category}>
                      <StoreMallDirectory className={styles.infoIcon} />
                      {product.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <ShoppingBag className={styles.emptyIcon} />
              <p>No products in your wishlist yet</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default WishList;
