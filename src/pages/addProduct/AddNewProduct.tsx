import React, { useState, useRef, useEffect } from 'react';
import './AddNewProduct.css';
import { 
  AddAPhoto, 
  Save, 
  AddCircleOutline, 
  Category, 
  AttachMoney, 
  Description, 
  // Palette,
  // LocalOffer,
  // Inventory
} from '@mui/icons-material';
import { createProduct, getShopDetails } from '../../Api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadImagesToSupabase } from '../../services/service';

const AddNewProduct: React.FC = () => {
  const { shopId } = useParams();
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [addedCategory, setAddedCategory] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [genderCategory, setGenderCategory] = useState<string>('mens');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    ShopDetails();
  }, []);

  const ShopDetails = async () => {
    try {
      const response = await getShopDetails(shopId as string);
      setShopDetails(response);
    } catch (error) {
      toast.error('Failed to load shop details');
    }
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

  const handleAddProduct = async () => {
    if (!name || !description || !price || uploadedImages.length === 0) {
      toast.error('Please fill in all required fields and upload at least one image');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name,
        description,
        price,
        productCategory: addedCategory || 'Extra',
        genderCategory: genderCategory || 'mens',
        images: [] as string[],
        stock,
        isAvailable,
        shopId: shopId as string,
        category: shopDetails?.category.name,
      };

      if (uploadedImages.length > 0) {
        productData.images = await uploadImagesToSupabase(uploadedImages);
      }
       console.log("productData",productData);
      const response = await createProduct(productData);
      toast.success('Product added successfully');
      if (response && response.status >= 200 && response.status < 300) {
        navigate(`/shop/${shopId}`);
      } else if (!response || !response.status) {
        // If response or response.status is not available, assume success based on no error being thrown
        navigate(`/shop/${shopId}`);
      }
    } catch (error) {
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      if (!shopDetails.productCategories) {
        setShopDetails({
          ...shopDetails,
          productCategories: [newCategory]
        });
      } else {
        setShopDetails({
          ...shopDetails,
          productCategories: [...shopDetails.productCategories, newCategory]
        });
      }
      setAddedCategory(newCategory);
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  return (
    <div className="add-product-container container">
      {/* Header */}
      <ToastContainer />
      <header className="add-product-header">
        <h1>Add New Product</h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => toast.info('Draft saved!')}
            disabled={isSubmitting}
          >
            <Save /> Save Draft
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleAddProduct}
            disabled={isSubmitting}
          >
            <AddCircleOutline /> {isSubmitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </header>

      <div className="add-product-grid">
        {/* Main Form Section */}
        <section className="product-form">
          {/* Product Name */}
          <div className="form-group">
            <h2>Product Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="form-input"
              required
            />
          </div>

          {/* Categories */}
          <div className="form-group">
            <h2><Category /> Categories</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Product Category</label>
                <div className="category-input-group">
                  {!showNewCategoryInput ? (
                    <>
                      <select 
                        value={addedCategory || 'Extra'}
                        onChange={(e) => {
                          if (e.target.value === 'add_new') {
                            setShowNewCategoryInput(true);
                          } else {
                            setAddedCategory(e.target.value);
                          }
                        }}
                        className="form-select"
                      >
                        <option value="All">All Categories</option>
                        {shopDetails?.productCategories?.map((category: string) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                        <option value="add_new">+ Add New Category</option>
                      </select>
                    </>
                  ) : (
                    <div className="new-category-input">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category"
                        className="form-input"
                      />
                      <div className="new-category-actions">
                        <button 
                          className="btn btn-small btn-primary"
                          onClick={handleAddNewCategory}
                        >
                          Add
                        </button>
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setNewCategory('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-field">
                <label>Gender Category</label>
                <select 
                  value={genderCategory}
                  onChange={(e) => setGenderCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="mens">Men's</option>
                  <option value="womens">Women's</option>
                  <option value="childrens">Children's</option>
                  <option value="extra">Extra</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="form-group">
            <h2><AttachMoney /> Pricing & Stock</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="₹ 500"
                  className="form-input"
                  min="0"
                  required
                />
              </div>
              <div className="form-field">
                <label>Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="Available units"
                  className="form-input"
                  min="0"
                />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select 
                  value={isAvailable ? 'Available' : 'Out of Stock'}
                  onChange={(e) => setIsAvailable(e.target.value === 'Available')}
                  className="form-select"
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <h2><Description /> Product Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a detailed description of the product..."
              className="form-textarea"
              required
            />
          </div>
        </section>

        {/* Image Upload Section */}
        <section className="image-upload-section">
          <h2><AddAPhoto /> Product Images</h2>
          <div className="image-preview-container">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected product"
                className="main-image"
              />
            ) : (
              <div className="image-placeholder" onClick={triggerFileInput}>
                <AddAPhoto />
                <p>Click to upload images</p>
              </div>
            )}
            <div className="image-thumbnails">
              {uploadedImages.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${image === selectedImage ? 'selected' : ''}`}
                  onClick={() => handleImageClick(image)}
                >
                  <img src={image} alt={`Product ${index + 1}`} />
                </div>
              ))}
              <button className="upload-button" onClick={triggerFileInput}>
                <AddAPhoto />
              </button>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
        </section>
      </div>

      {/* Footer Actions */}
      <footer className="add-product-footer">
        <button 
          className="btn btn-secondary"
          onClick={() => toast.info('Draft saved!')}
          disabled={isSubmitting}
        >
          <Save /> Save Draft
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleAddProduct}
          disabled={isSubmitting}
        >
          <AddCircleOutline /> {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
      </footer>
    </div>
  );
};

export default AddNewProduct;