import React, { useState } from 'react';
import styles from './WishList.module.css';
import { shopeImages, sneakersImages } from '../../Pictures';

interface Shop {
  id: string;
  name: string;
  image: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
}

const WishList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([
    { id: '1', name: 'Fashion Store', image: shopeImages.shop1, location: 'New York' },
    { id: '2', name: 'Trendy Boutique', image: shopeImages.shop2, location: 'Los Angeles' },
    { id: '3', name: 'Trendy Boutique', image: shopeImages.shop3, location: 'Los Angeles' },
    { id: '4', name: 'Trendy Boutique', image: shopeImages.shop4, location: 'Los Angeles' },
    { id: '5', name: 'Trendy Boutique', image: shopeImages.shop5, location: 'Los Angeles' },
    { id: '6', name: 'Trendy Boutique', image: shopeImages.shop6, location: 'Los Angeles' },
  ]);

  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([
    { id: '1', name: 'Stylish T-Shirt', image: sneakersImages.sneakers1, price: '$29.99' },
    { id: '2', name: 'Comfortable Jeans', image: sneakersImages.sneakers2, price: '$59.99' },
    { id: '3', name: 'Stylish T-Shirt', image: sneakersImages.sneakers3, price: '$29.99' },
    { id: '4', name: 'Comfortable Jeans', image: sneakersImages.sneakers4, price: '$59.99' },
    { id: '5', name: 'Stylish T-Shirt', image: sneakersImages.sneakers5, price: '$29.99' },
    { id: '6', name: 'Comfortable Jeans', image: sneakersImages.sneakers6, price: '$59.99' },
  ]);

  const removeShop = (id: string) => {
    setFavoriteShops(favoriteShops.filter(shop => shop.id !== id));
  };

  const removeProduct = (id: string) => {
    setFavoriteProducts(favoriteProducts.filter(product => product.id !== id));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Wishlist</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'shops' ? styles.active : ''}`}
          onClick={() => setActiveTab('shops')}
        >
          Shops
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
      </div>

      <div className={styles.wishlistGrid}>
        {activeTab === 'shops' ? (
          favoriteShops.map(shop => (
            <div key={shop.id} className={styles.wishlistItem}>
              <button 
                className={styles.removeButton} 
                onClick={() => removeShop(shop.id)}
              >
                ×
              </button>
              <img src={shop.image} alt={shop.name} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <h3>{shop.name}</h3>
                <p>{shop.location}</p>
              </div>
            </div>
          ))
        ) : (
          favoriteProducts.map(product => (
            <div key={product.id} className={styles.wishlistItem}>
              <button 
                className={styles.removeButton} 
                onClick={() => removeProduct(product.id)}
              >
                ×
              </button>
              <img src={product.image} alt={product.name} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishList;
