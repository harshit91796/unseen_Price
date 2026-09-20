import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Close, Store, Phone, Description, Email, AddAPhoto, Delete, RoomService } from '@mui/icons-material';
import styles from './AddShopModal.module.css';
import LocationPicker, { PickedLocation } from '../../../components/LocationPicker/LocationPicker';

const MODAL_PORTAL_ID = 'add-shop-modal-portal';

function getOrCreateModalPortal(): HTMLElement {
  let el = document.getElementById(MODAL_PORTAL_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = MODAL_PORTAL_ID;
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;pointer-events:none;';
    document.body.insertBefore(el, document.body.firstChild);
  }
  return el;
}
import { FaCity } from 'react-icons/fa';
import { uploadImagesToSupabase, safeRevokeBlobUrl } from '../../../services/service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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


const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose, onSubmit, categories = [] }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const rootEl = document.getElementById('root');

    if (isOpen) {
      // Save current state
      const scrollY = window.scrollY;
      const prevHtmlOverflow = htmlEl.style.overflow;
      const prevBodyOverflow = bodyEl.style.overflow;
      const prevRootOverflow = rootEl ? rootEl.style.overflow : '';
      const prevRootPosition = rootEl ? rootEl.style.position : '';
      
      // Lock scrolling
      htmlEl.style.overflow = 'hidden';
      bodyEl.style.overflow = 'hidden';
      if (rootEl) {
        rootEl.style.overflow = 'hidden';
        rootEl.style.position = 'relative';
      }
      
      // Cleanup function
      return () => {
        // Force restore styles
        htmlEl.style.overflow = prevHtmlOverflow || '';
        bodyEl.style.overflow = prevBodyOverflow || '';
        if (rootEl) {
          rootEl.style.overflow = prevRootOverflow || '';
          rootEl.style.position = prevRootPosition || '';
        }
        
        // If still hidden after restore, explicitly set to visible
        if (htmlEl.style.overflow === 'hidden') htmlEl.style.overflow = '';
        if (bodyEl.style.overflow === 'hidden') bodyEl.style.overflow = '';
        if (rootEl && rootEl.style.overflow === 'hidden') rootEl.style.overflow = '';
        
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Revoke any leftover blob URLs on unmount (user closed modal without submitting)
  useEffect(() => {
    return () => {
      uploadedImages.forEach(safeRevokeBlobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [businessType, setBusinessType] = useState<'shop' | 'service' | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'shop' as 'shop' | 'service',
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

  const handleSelectBusinessType = (type: 'shop' | 'service') => {
    setBusinessType(type);
    setFormData(prev => ({ ...prev, type }));
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

  const handleRemoveImage = (imageToRemove: string) => {
    safeRevokeBlobUrl(imageToRemove); // free memory if it's a blob URL
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
    setFormError('');

    // Checked here so the owner sees the reason. The server enforces the same
    // rules, but its message used to be swallowed by a generic toast.
    const coords = formData.targeting.coordinates;
    const hasPin = Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);
    const phoneDigits = String(formData.phone || '').replace(/\D/g, '');

    const problem =
      !formData.name.trim() ? 'Enter your business name.' :
      !formData.category.name ? 'Choose a category.' :
      phoneDigits.length < 7 ? 'Enter a phone number customers can call.' :
      !hasPin ? 'Set your location: search for your address and confirm the pin on the map.' :
      uploadedImages.length === 0 ? 'Upload at least one photo.' :
      '';

    if (problem) {
      setFormError(problem);
      toast.error(problem);
      return;
    }

    try {
      let shopDataToSubmit = { ...formData };
      shopDataToSubmit.images = await uploadImagesToSupabase(uploadedImages);

      await onSubmit(shopDataToSubmit);
      onClose();
    } catch (error: any) {
      // Keep the modal open so nothing the owner typed is lost.
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Could not save your business. Please try again.';
      setFormError(message);
      toast.error(message);
    }
  };




  if (!isOpen) return null;

  const modalElement = (
    <div 
      className={styles.modalOverlay} 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ 
        pointerEvents: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647
      }}
    >
      <ToastContainer />
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <div className={styles.modalHeader}>
          <h2>
            {businessType === 'service' ? <RoomService /> : <Store />}
            {businessType === null
              ? 'Add New Business'
              : businessType === 'service'
                ? 'Add Service Business (Step 1 of 2)'
                : 'Add New Shop'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <Close />
          </button>
        </div>

        {businessType === null ? (
          <div className={styles.typePickerSection}>
            <p className={styles.typePickerTitle}>What kind of business are you adding?</p>
            <div className={styles.typePickerGrid}>
              <button
                type="button"
                className={styles.typePickerCard}
                onClick={() => handleSelectBusinessType('shop')}
              >
                <Store className={styles.typePickerIcon} />
                <h3>Shop</h3>
                <p>Sells physical products (clothing, electronics, food, toys). You'll add products one by one after creating it.</p>
              </button>
              <button
                type="button"
                className={styles.typePickerCard}
                onClick={() => handleSelectBusinessType('service')}
              >
                <RoomService className={styles.typePickerIcon} />
                <h3>Service Business</h3>
                <p>Offers services (salon, clinic, hotel, gym, restaurant). You'll add individual services (e.g. Haircut, Room) after creating it.</p>
              </button>
            </div>
          </div>
        ) : (
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

            {/* Search, then confirm the pin. Without a pin the shop cannot be
                found in any nearby search, which is how 18 shops ended up invisible. */}
            <LocationPicker
              value={{
                coordinates: (formData.targeting.coordinates as [number, number]) || null,
                address: formData.address
              }}
              onChange={(next: PickedLocation) => setFormData(prev => ({
                ...prev,
                address: next.address,
                targeting: {
                  ...prev.targeting,
                  coordinates: next.coordinates || [0, 0],
                  city: next.address.city,
                  state: next.address.state,
                  country: next.address.country
                }
              }))}
              error={formError}
            />

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
            <button type="button" className={styles.cancelButton} onClick={() => setBusinessType(null)}>
              Back
            </button>
            <button type="submit" className={styles.submitButton}>
              {businessType === 'service' ? 'Add Service' : 'Add Shop'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalElement, getOrCreateModalPortal());
};

export default AddShopModal;
