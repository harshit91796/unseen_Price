import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Close, Store, LocationOn, Phone, Description, Email, AddAPhoto, Delete } from '@mui/icons-material';
import styles from './AddShopModal.module.css';

const MODAL_PORTAL_ID = 'add-shop-modal-portal';

function getOrCreateModalPortal(): HTMLElement {
  let el = document.getElementById(MODAL_PORTAL_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = MODAL_PORTAL_ID;
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;pointer-events:auto;';
    document.body.insertBefore(el, document.body.firstChild);
  }
  return el;
}
import { FaCity } from 'react-icons/fa';
import { uploadImagesToSupabase } from '../../../services/service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchPlaceSuggestions } from '../../../utils/opencage';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shopData: any) => void;
  categories: Category[];
}

interface Category {
  name: string;
  image: string;
}

interface LocationSuggestion {
  formatted: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose, onSubmit, categories = [] }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const root = document.getElementById('root');
    const prevRootOverflow = root ? root.style.overflow : '';
    const prevRootPosition = root ? root.style.position : '';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (root) {
      root.style.overflow = 'hidden';
      root.style.position = 'relative';
    }
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      if (root) {
        root.style.overflow = prevRootOverflow;
        root.style.position = prevRootPosition;
      }
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    targeting: {
      coordinates: [0, 0],
      city: '',
      state: '',
      country: ''
    },
    description: '',
    category: {
      name: '',
      image: ''
    },
    openingTime: '',
    closingTime: '',
    images: [] as string[],
  });

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

  const handleRemoveImage = (imageToRemove: string) => {
    setUploadedImages(prevImages => prevImages.filter(image => image !== imageToRemove));
    if (selectedImage === imageToRemove) {
      setSelectedImage(uploadedImages.find(image => image !== imageToRemove) || null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let shopDataToSubmit = { ...formData };
        console.log( 'shopDataToSubmit', shopDataToSubmit);
      if (uploadedImages.length > 0) {
        shopDataToSubmit.images = uploadedImages;
        const uploadedImageUrls = await uploadImagesToSupabase(uploadedImages);
        shopDataToSubmit.images = uploadedImageUrls;
      }else{
        toast.error('Please upload at least one image');
        return;
      }

      await onSubmit(shopDataToSubmit);
      onClose();
    } catch (error) {
      console.error('Error submitting shop data:', error);
    }
  };

  const handleLocationSearch = async (query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!query.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const suggestions = await fetchPlaceSuggestions(query);
        console.log( 'suggestions', suggestions);
        setLocationSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    }, );

    setSearchTimeout(timeout);
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    const { street, city, state, country } = suggestion.formatted;
    console.log( 'suggestion', suggestion.formatted , 'street', street , 'city', city , 'state', state , 'country', country);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        street: street || '',
        city: city || '',
        state: state || '',
        country: country || ''
      },
      targeting: {
        ...prev.targeting,
        coordinates: [suggestion.coordinates.lng, suggestion.coordinates.lat],
        city: city || '',
        state: state || '',
        country: country || ''
      }
    }));
    
    setShowSuggestions(false);
  };

  const formatAddress = (suggestion: LocationSuggestion) => {
    const { street, city, state, country } = suggestion.formatted;
    const parts = [street, city, state, country].filter(Boolean);
    return parts.join(', ');
  };

  if (!isOpen) return null;

  const modalElement = (
    <div 
      className={styles.modalOverlay} 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ pointerEvents: 'auto' }}
    >
      <ToastContainer />
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <div className={styles.modalHeader}>
          <h2><Store /> Add New Shop</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <Close />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Image Upload Section */}
          <div className={styles.imageUploadSection}>
            <h3><AddAPhoto /> Shop Images</h3>
            <div className={styles.imagePreviewContainer}>
              {selectedImage ? (
                <div className={styles.mainImageContainer}>
                  <img
                    src={selectedImage}
                    alt="Selected shop"
                    className={styles.mainImage}
                  />
                  <button 
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => handleRemoveImage(selectedImage)}
                  >
                    <Delete />
                  </button>
                </div>
              ) : (
                <div className={styles.imagePlaceholder} onClick={triggerFileInput}>
                  <AddAPhoto />
                  <p>Click to upload images</p>
                </div>
              )}
              <div className={styles.imageThumbnails}>
                {uploadedImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`${styles.thumbnail} ${image === selectedImage ? styles.selected : ''}`}
                  >
                    <img 
                      src={image} 
                      alt={`Shop ${index + 1}`} 
                      onClick={() => handleImageClick(image)}
                    />
                    <button 
                      type="button"
                      className={styles.removeThumbnailBtn}
                      onClick={() => handleRemoveImage(image)}
                    >
                      <Delete />
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className={styles.uploadButton} 
                  onClick={triggerFileInput}
                >
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
              className={styles.hiddenInput}
            />
          </div>

          {/* Rest of the form fields */}
          <div className={styles.formFields}>
            <div className={styles.inputGroup}>
              <Store className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Shop Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <LocationOn className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Search for location..."
                onChange={(e) => handleLocationSearch(e.target.value)}
                required
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className={styles.locationSuggestions}>
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={styles.suggestionItem}
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      {formatAddress(suggestion)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Street Address"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <FaCity className={styles.inputIcon} />
              <input
                type="text"
                placeholder="City"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value },
                  targeting: { ...formData.targeting, city: e.target.value }
                })}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="State"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value },
                  targeting: { ...formData.targeting, state: e.target.value }
                })}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zipCode: e.target.value }
                })}
                required
              />
            </div>

            <div className={styles.inputGroup}>   
              <input
                type="text"
                placeholder="Country"
                value={formData.address.country}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, country: e.target.value },
                  targeting: { ...formData.targeting, country: e.target.value }
                })}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <Phone className={styles.inputIcon} />
              <input
                type="tel"
                placeholder="Contact Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <Email className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <Description className={styles.inputIcon} />
              <textarea
                placeholder="Shop Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <select
                  value={formData.category.name}
                  onChange={(e) => setFormData({...formData, category: {
                    name: e.target.value,
                    image: formData.category.image
                  }})}
                  required
                >
                  <option value="">Select category</option>
                  {(Array.isArray(categories) ? categories : []).map((category) => (
                    <option key={category.name} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.timeInputs}>
                <input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                  required
                />
                <span>to</span>
                <input
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Shop
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalElement, getOrCreateModalPortal());
};

export default AddShopModal;
