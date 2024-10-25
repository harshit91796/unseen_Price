import React, { useState, useRef } from 'react';
import styles from './AddNewProduct.module.css';

const AddNewProduct: React.FC = () => {
  const [category, setCategory] = useState<string>('Extra');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
      if (!selectedImage) {
        setSelectedImage(newImages[0]);
      }
    }
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1>Add New Product</h1>
        <div className={styles.actionButtons}>
          <button className={styles.saveDraft}>Save Draft</button>
          <button className={styles.addProduct}>Add Product</button>
        </div>
      </div>

      {/* Product Information Section */}
      <div className={styles.infoGrid}>
        <div className={styles.infoBlock_1}>
             {/* General Information */}
        <div className={styles.infoBlock}>
          <h2>General Information</h2>
          <p>Product Name</p>
          <select className={styles.infoField}>
             
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
                <option value="Puffer Jacket">Puffer Jacket</option>
            
          </select>
          <p>Size</p>
          <select className={styles.infoField}>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="M, XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>
          </select>
        </div>

        {/* Price and Availability */}
        <div className={styles.infoBlock}>
          <h2>Price And Availability</h2>
          <div className={styles.infoRow}>
            <div className={styles.infoField}>
              <p>Price</p>
              <input type="number" placeholder='₹ 500' />
            </div>
            <div className={styles.infoField}>
              <p>Current Status</p>
              <select>
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoField}>
              <p>Discount</p>
              <input type="number" placeholder='10%' />
            </div>
            <div className={styles.infoField}>
              <p>Colour</p>
              <input type="text" placeholder='Blue, Black, Grey' />
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className={styles.infoBlock}>
          <h2>Product Description</h2>
          <textarea className={styles.infoField_textarea} placeholder="Write a detailed description of the product here..." />
        </div>
        </div>

        <div className={styles.infoBlock_2}>
            {/* Image Upload Section */}
        <div className={styles.uploadSection}>
          <h2>Upload Img</h2>
          <div className={styles.imagePreview}>
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected product"
                className={styles.mainImage}
              />
            ) : (
              <div className={styles.placeholderImage}>No image selected</div>
            )}
            <div className={styles.thumbnailGrid}>
              {uploadedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`thumb${index + 1}`}
                  onClick={() => handleImageClick(image)}
                  className={image === selectedImage ? styles.selectedThumbnail : ''}
                />
              ))}
              <button className={styles.uploadBtn} onClick={triggerFileInput}>+</button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Category Management */}
        <div className={styles.categorySection}>
          <h2>Category</h2>
          <p>Category Slide</p>
          <input
            type="text"
            value={category}
            onChange={handleCategoryChange}
            className={styles.categoryInput}
          />
          <button className={styles.addCategorySlide}>Add Category Slide</button>

          <p>Product Category</p>
          <select className={styles.infoField}>
            <option value="Category 1">Mens</option>
            <option value="Category 2">Womens</option>
            <option value="Category 3">Kids</option>
          </select>
          <button className={styles.addCategory}>Add Category</button>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.saveDraft}>Save Draft</button>
        <button className={styles.addProduct}>Add Product</button>
      </div>
    </div>
  );
};

export default AddNewProduct;
