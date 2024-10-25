import React, { useState } from 'react';
import styles from './productDetails.module.css';
import ImageModal from '../../components/imageModal/ImageModal';
import { productImages, sneakersImages } from '../../Pictures';

const ProductDetails: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const Images = [productImages.productImage1, productImages.productImage2, productImages.productImage3, productImages.productImage4, productImages.productImage5];
  const relatedProducts = [
    { name: 'Sweatshirt 1', price: '₹799', image: 'https://picsum.photos/212' },
    { name: 'Sweatshirt 2', price: '₹899', image: 'https://picsum.photos/213' },
    { name: 'Sweatshirt 3', price: '₹1099', image: 'https://picsum.photos/214' },
  ];

  const frequentlyBought = [
    { name: 'Sneakers 1', price: '₹1499', image: sneakersImages.sneakers1 },
    { name: 'Sneakers 2', price: '₹499', image: sneakersImages.sneakers2 },
    { name: 'Sneakers 3', price: '₹1799', image: sneakersImages.sneakers3 },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.logo}>FashionStore</div>
        <nav className={styles.navbar}>
          <a href="#">Home</a>
          <a href="#">Men</a>
          <a href="#">Women</a>
          <a href="#">Cart</a>
        </nav>
      </header>

      {/* Product Section */}
      <div className={styles.mainSection}>
        {/* Product Images Grid */}
        <div className={styles.imageGrid}>
          {Images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Product ${index + 1}`}
              className={styles.productImage}
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
        </div>

        {/* Product Details */}
        <div className={styles.productDetails}>
          <h1>Men’s Sweatshirt</h1>
          <p className={styles.price}>
            ₹1,199 <span className={styles.discount}>₹1,499</span>
          </p>

          <div className={styles.rating}>
            <span>⭐⭐⭐⭐☆</span> (120 reviews)
          </div>

          <p className={styles.availability}>In Stock</p>

          <button className={styles.addToCartBtn}>Add to Cart</button>
          <button className={styles.buyNowBtn}>Buy Now</button>

          <div className={styles.productDescription}>
            <h3>Product Details</h3>
            <p>This sweatshirt offers ultimate comfort with a soft fabric finish and a perfect fit for everyday wear.</p>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className={styles.relatedProducts}>
        <h2>Similar Products</h2>
        <div className={styles.productGrid}>
          {relatedProducts.map((product, index) => (
            <div key={index} className={styles.productCard}>
              <img src={product.image} alt={product.name} />
              <p>{product.name}</p>
              <p>{product.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Bought Together Section */}
      <div className={styles.frequentlyBought}>
        <h2>Frequently Bought Together</h2>
        <div className={styles.productGrid}>
          {frequentlyBought.map((product, index) => (
            <div key={index} className={styles.productCard}>
              <img src={product.image} alt={product.name} />
              <p>{product.name}</p>
              <p>{product.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>&copy; 2024 FashionStore. All Rights Reserved.</p>
      </footer>

      {selectedImageIndex !== null && (
        <ImageModal
          images={Images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
};

export default ProductDetails;
