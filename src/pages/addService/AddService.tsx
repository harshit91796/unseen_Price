import React, { useState, useRef, useEffect } from 'react';
import '../addProduct/AddNewProduct.css';
import {
  AddAPhoto,
  Save,
  AddCircleOutline,
  Category,
  AttachMoney,
  Description,
  Schedule,
  EventAvailable
} from '@mui/icons-material';
import { createService, getShopDetails } from '../../Api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadImagesToSupabase, safeRevokeBlobUrl } from '../../services/service';
import { PRICE_TYPES, OTHER_SERVICE_TYPE } from '../../constants/serviceOptions';
// The list comes from the database, so every dropdown in the app agrees and an
// admin can add a type without a deploy.
import useServiceTypes from '../../hooks/useServiceTypes';
import usePageMeta from '../../hooks/usePageMeta';
import { NumberField, readNumberField, toNumber } from '../../utils/numberField';

const AddService: React.FC = () => {
  usePageMeta({ title: 'Add Service', noindex: true });
  const { shopId } = useParams();
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  // Empty, not 0: a box showing 0 meant every typed price came out as "0550".
  const [price, setPrice] = useState<NumberField>('');
  const [mrp, setMrp] = useState<NumberField>('');
  const [priceType, setPriceType] = useState<string>('fixed');
  const [duration, setDuration] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  // What the owner types when their trade is not on the list yet.
  const [customType, setCustomType] = useState<string>('');
  const [bookingRequired, setBookingRequired] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { types: serviceTypes, loading: typesLoading } = useServiceTypes();
  const priceValue = toNumber(price);
  const mrpValue = toNumber(mrp);
  const isOtherType = serviceType === OTHER_SERVICE_TYPE;

  const navigate = useNavigate();

  useEffect(() => {
    loadShopDetails();
  }, []);

  // Cleanup any blob URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach(safeRevokeBlobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadShopDetails = async () => {
    try {
      const response = await getShopDetails(shopId as string);
      setShopDetails(response);
      if (response.type !== 'service') {
        toast.error('This is not a service-type business');
        setTimeout(() => navigate(`/shop/${shopId}`), 1500);
      }
    } catch (error) {
      toast.error('Failed to load business details');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
      if (!selectedImage) setSelectedImage(newImages[0]);
    }
  };

  const handleImageClick = (image: string) => setSelectedImage(image);
  const triggerFileInput = () => fileInputRef.current?.click();

  const handleAddService = async () => {
    if (!name || !description || !price || !serviceType || uploadedImages.length === 0) {
      toast.error('Please fill in all required fields and upload at least one image');
      return;
    }
    if (isOtherType && customType.trim().length < 2) {
      toast.error('Tell us what kind of service this is, e.g. Tailor or Car Wash');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImageUrls = await uploadImagesToSupabase(uploadedImages);

      if (mrpValue > 0 && mrpValue <= priceValue) {
        toast.warning("MRP should be higher than the selling price (otherwise leave it empty)");
        setIsSubmitting(false);
        return;
      }

      const serviceData: any = {
        name,
        description,
        price: priceValue,
        mrp: mrpValue > 0 ? mrpValue : null,
        priceType,
        duration,
        // With "Other", the word the owner typed becomes the service type itself,
        // so their listing is text-searchable straight away. isCustomType tells the
        // backend this is a new type being proposed, for an admin to approve; without
        // that flag an unknown type is rejected.
        serviceType: (isOtherType ? customType : serviceType).trim().toLowerCase(),
        isCustomType: isOtherType,
        category: shopDetails?.category?.name || '',
        images: uploadedImageUrls,
        isAvailable,
        bookingRequired,
        shopId: shopId as string,
        targeting: shopDetails?.targeting,
        address: shopDetails?.address
      };

      await createService(serviceData);
      toast.success(
        isOtherType
          ? 'Service added. Your service type is live and searchable, and our team will add it to the filters.'
          : 'Service added successfully'
      );
      navigate(`/shop/${shopId}`);
    } catch (error: any) {
      // The backend rejects an unrecognised service type with a message worth
      // reading, so show it instead of a generic failure.
      toast.error(error?.response?.data?.message || 'Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-container container">
      <ToastContainer />
      <header className="add-product-header">
        <h1>Add New Service</h1>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleAddService}
            disabled={isSubmitting}
          >
            <AddCircleOutline /> {isSubmitting ? 'Adding...' : 'Add Service'}
          </button>
        </div>
      </header>

      <div className="add-product-grid">
        <section className="product-form">
          <div className="form-group">
            <h2>Service Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Haircut, Dental Cleaning, Deluxe Room"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <h2><Category /> Service Type</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Type <span style={{color:'#ef4444'}}>*</span></label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="form-select"
                  disabled={typesLoading}
                  required
                >
                  <option value="">{typesLoading ? 'Loading types...' : 'Select service type'}</option>
                  {serviceTypes.map(t => (
                    <option key={t.name} value={t.name}>{t.label}</option>
                  ))}
                  <option value={OTHER_SERVICE_TYPE}>Other — my service is not listed</option>
                </select>
              </div>
              <div className="form-field">
                <label>Booking Required</label>
                <select
                  value={bookingRequired ? 'yes' : 'no'}
                  onChange={(e) => setBookingRequired(e.target.value === 'yes')}
                  className="form-select"
                >
                  <option value="no">No (Walk-in)</option>
                  <option value="yes">Yes (Booking required)</option>
                </select>
              </div>
            </div>

            {/* An owner whose trade is missing used to have to pick something
                wrong or give up. Now they name it, list today, and our team adds
                it to the customer filters. */}
            {isOtherType && (
              <div className="form-field" style={{ marginTop: '0.75rem' }}>
                <label>What kind of service is it? <span style={{color:'#ef4444'}}>*</span></label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Tailor, Car Wash, Pet Grooming"
                  className="form-input"
                  maxLength={40}
                  required
                />
                <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  Your listing goes live straight away and customers can find it by
                  searching this word. We will add it to the filter list shortly.
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
            <h2><AttachMoney /> Pricing</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Selling Price <span style={{color:'#ef4444'}}>*</span></label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(readNumberField(e.target.value))}
                  placeholder="₹ 500"
                  className="form-input"
                  min="0"
                  required
                />
              </div>
              <div className="form-field">
                <label>Original Price <span style={{color:'#9ca3af', fontWeight:400, fontSize:'0.8rem'}}>(optional — shows discount)</span></label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(readNumberField(e.target.value))}
                  placeholder="₹ 999"
                  className="form-input"
                  min="0"
                />
              </div>
              <div className="form-field">
                <label>Price Type</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="form-select"
                >
                  {PRICE_TYPES.map(pt => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select
                  value={isAvailable ? 'Available' : 'Unavailable'}
                  onChange={(e) => setIsAvailable(e.target.value === 'Available')}
                  className="form-select"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <h2><Schedule /> Duration</h2>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder='e.g. "30 minutes", "1 hour", "Per night"'
              className="form-input"
            />
          </div>

          <div className="form-group">
            <h2><Description /> Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this service includes..."
              className="form-textarea"
              required
            />
          </div>
        </section>

        <section className="image-upload-section">
          <h2><AddAPhoto /> Service Images</h2>
          <div className="image-preview-container">
            {selectedImage ? (
              <img src={selectedImage} alt="Selected service" className="main-image" />
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
                  <img src={image} alt={`Service ${index + 1}`} />
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

      <footer className="add-product-footer">
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/shop/${shopId}`)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleAddService}
          disabled={isSubmitting}
        >
          <EventAvailable /> {isSubmitting ? 'Adding...' : 'Add Service'}
        </button>
      </footer>
    </div>
  );
};

export default AddService;
