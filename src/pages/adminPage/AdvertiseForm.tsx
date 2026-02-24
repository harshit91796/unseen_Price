import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { fetchPlaceSuggestions } from '../../utils/opencage';
import styles from './AdminDashboard.module.css';
import { createAdvertisement, updateAdvertisement } from '../../Api';
import { uploadImagesToSupabase } from '../../services/service';

/** When provided, form is in edit mode and will call update instead of create */
export interface InitialAdForEdit {
  _id: string;
  title: string;
  description: string;
  images: string[];
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
  link?: string;
  isActive?: boolean;
}

interface AdvertiseFormProps {
  initialAd?: InitialAdForEdit | null;
  onClose: () => void;
  onSuccess: () => void;
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

interface AdFormData {
  title: string;
  description: string;
  images: string[];
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
  link: string;
  isActive: boolean;
}

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const AdvertiseForm: React.FC<AdvertiseFormProps> = ({ initialAd, onClose, onSuccess }) => {
  const isEditMode = Boolean(initialAd?._id);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [adFormData, setAdFormData] = useState<AdFormData>({
    title: '',
    description: '',
    images: [],
    targeting: {
      coordinates: [0, 0],
      city: '',
      state: '',
      country: '',
      radius: 100,
      targetType: 'CITY'
    },
    startDate: '',
    endDate: '',
    link: '',
    isActive: true
  });

  useEffect(() => {
    if (!initialAd) return;
    setAdFormData({
      title: initialAd.title || '',
      description: initialAd.description || '',
      images: initialAd.images || [],
      targeting: {
        coordinates: initialAd.targeting?.coordinates ?? [0, 0],
        city: initialAd.targeting?.city ?? '',
        state: initialAd.targeting?.state ?? '',
        country: initialAd.targeting?.country ?? '',
        radius: initialAd.targeting?.radius ?? 100,
        targetType: initialAd.targeting?.targetType ?? 'CITY'
      },
      startDate: initialAd.startDate ? initialAd.startDate.slice(0, 10) : '',
      endDate: initialAd.endDate ? initialAd.endDate.slice(0, 10) : '',
      link: initialAd.link ?? '',
      isActive: initialAd.isActive ?? true
    });
    setUploadedImages(initialAd.images || []);
  }, [initialAd]);

  const handleLocationSearch = async (query: string) => {
    setLocationQuery(query);
    if (query.length > 2) {
      const suggestions = await fetchPlaceSuggestions(query);
      setLocationSuggestions(suggestions);
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    const { street, city, state, country } = suggestion.formatted;
    setAdFormData(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        coordinates: [suggestion.coordinates.lng, suggestion.coordinates.lat],
        city,
        state,
        country,
        targetType: 'CITY',
        radius: 100
      }
    }));
    setLocationSuggestions([]);
    setLocationQuery([street, city, state, country].filter(Boolean).join(', '));
  };

  const handleGlobalTargeting = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isGlobal = e.target.checked;
    setLocationQuery('');
    setAdFormData(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        state: '',
        city: '',
        coordinates: [0, 0],
        country: '',
        targetType: isGlobal ? 'GLOBAL' : 'CITY',
        radius: isGlobal ? 1000 : 100
      }
    }));
  };

  const handleStateSelect = (state: string) => {
    setLocationQuery('');
    setAdFormData(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        state,
        city: '',
        coordinates: [0, 0],
        country: '',
        targetType: state ? 'STATE' : 'CITY',
        radius: state ? 500 : 100
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
      setAdFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setAdFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (adFormData.title.length === 0) {
        toast.error('Please enter a headline');
        return;
      }
      if (adFormData.description.length === 0) {
        toast.error('Please enter a description');
        return;
      }
      if (adFormData.link.length === 0) {
        toast.error('Please enter a destination url');
        return;
      }
      if (adFormData.startDate.length === 0) {
        toast.error('Please enter a start date');
        return;
      }
      if (adFormData.endDate.length === 0) {
        toast.error('Please enter an end date');
        return;
      }
      if (uploadedImages.length === 0) {
        toast.error('Please upload at least one image');
        return;
      }
      if (uploadedImages.length > 1) {
        toast.error('Please upload only one image');
        return;
      }

      // Separate existing URLs from new blob URLs (need upload)
      const existingUrls = uploadedImages.filter((src) => src.startsWith('http'));
      const newBlobUrls = uploadedImages.filter((src) => !src.startsWith('http'));
      const uploadedNewUrls = newBlobUrls.length > 0 ? await uploadImagesToSupabase(newBlobUrls) : [];
      const finalImageUrls = [...existingUrls, ...uploadedNewUrls];

      const advertisementData = {
        ...adFormData,
        images: finalImageUrls
      };

      if (isEditMode && initialAd?._id) {
        await updateAdvertisement(initialAd._id, advertisementData);
        toast.success('Advertisement updated successfully');
      } else {
        await createAdvertisement(advertisementData);
        toast.success('Advertisement created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(isEditMode ? 'Error updating advertisement' : 'Error creating advertisement', error);
      toast.error(isEditMode ? 'Failed to update advertisement' : 'Failed to create advertisement');
    }
  };

  const formatAddress = (suggestion: LocationSuggestion) => {
    const { street, city, state, country } = suggestion.formatted;
    const parts = [street, city, state, country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className={styles.adFormOverlay}>
      <div className={styles.layoutContainer}>
        <header className={styles.formHeader}>
          <div className={styles.headerLeft}>
            <Close onClick={onClose} />
          </div>
        </header>

        <div className={styles.formContent}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <div className={styles.formHeaderText}>
                <p className={styles.formTitle}>{isEditMode ? 'Edit Ad' : 'Create Ad'}</p>
                <p className={styles.formStep}>Step 1: {isEditMode ? 'Edit ad' : 'Create ad'}</p>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Location Targeting</h3>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <p>Select State</p>
                <select 
                  className={styles.selectInput}
                  value={adFormData.targeting.state}
                  onChange={(e) => handleStateSelect(e.target.value)}
                >
                  <option value="">Select a state</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <p>Location Targeting</p>
                <input
                  type="text"
                  className={styles.selectInput}
                  placeholder="Search for location"
                  value={locationQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                />
                {locationSuggestions.length > 0 && (
                  <div className={styles.suggestions}>
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
              </label>
            </div>

            <div className={styles.globalCheckbox}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={adFormData.targeting.targetType === 'GLOBAL'}
                  onChange={handleGlobalTargeting}
                />
              </div>
              <div className={styles.checkboxContent}>
                <p className={styles.checkboxTitle}>Global</p>
                <p className={styles.checkboxDescription}>All users will see this ad</p>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Ad Content</h3>
            <div className={styles.uploadSection}>
              <div className={styles.uploadContainer}>
                <p className={styles.uploadTitle}>Upload image or video</p>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="imageUpload" className={styles.uploadButton}>
                  <span>Upload</span>
                </label>
                {uploadedImages.length > 0 && (
                  <div className={styles.imagePreview}>
                    {uploadedImages.map((image, index) => (
                      <div key={index} className={styles.imagePreviewItem}>
                        <img src={image} alt={`Preview ${index + 1}`} />
                        <button
                          className={styles.removeImageButton}
                          onClick={() => handleRemoveImage(index)}
                          type="button"
                        >
                          <Close />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <p>Headline</p>
                <textarea
                  placeholder="Max 30 characters"
                  className={styles.textArea}
                  value={adFormData.title}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={30}
                  required
                />
              </label>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <p>Description</p>
                <textarea
                  placeholder="Max 90 characters"
                  className={styles.textArea}
                  value={adFormData.description}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, description: e.target.value }))}
                  maxLength={90}
                  required
                />
              </label>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <p>Destination URL</p>
                <textarea
                  placeholder="https://example.com"
                  className={styles.textArea}
                  value={adFormData.link}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, link: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <p>Start Date</p>
                <input
                  type="date"
                  className={styles.selectInput}
                  value={adFormData.startDate}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </label>
              <label className={styles.inputLabel}>
                <p>End Date</p>
                <input
                  type="date"
                  className={styles.selectInput}
                  value={adFormData.endDate}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className={styles.formActions}>
              <button className={styles.continueButton} onClick={handleSubmit}>
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiseForm;
