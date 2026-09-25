import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Close, Save, AddAPhoto } from '@mui/icons-material';
import { uploadImagesToSupabase } from '../../../services/service';
import { PRICE_TYPES, OTHER_SERVICE_TYPE, prettyServiceType } from '../../../constants/serviceOptions';
import useServiceTypes from '../../../hooks/useServiceTypes';
import { NumberField, readNumberField, toNumber, fromSaved } from '../../../utils/numberField';
import { toast } from 'react-toastify';
// Reuses the product modal's styling so both edit screens look identical.
import '../../productView/edit modal/ProductEditModal.css';

/**
 * Edit an existing service.
 *
 * Until now a service could only be created and deleted. An owner who mistyped a
 * price or wanted to change a photo had to delete the listing and start again,
 * losing its reviews and its shared links.
 */

interface ServiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onUpdate: (updatedData: any) => Promise<void>;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({ isOpen, onClose, service, onUpdate }) => {
  const [name, setName] = useState<string>(service?.name || '');
  const [description, setDescription] = useState<string>(service?.description || '');
  const [price, setPrice] = useState<NumberField>(fromSaved(service?.price));
  const [mrp, setMrp] = useState<NumberField>(fromSaved(service?.mrp));
  const [priceType, setPriceType] = useState<string>(service?.priceType || 'fixed');
  const [duration, setDuration] = useState<string>(service?.duration || '');
  const [serviceType, setServiceType] = useState<string>(service?.serviceType || '');
  const [customType, setCustomType] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(service?.isAvailable ?? true);
  const [bookingRequired, setBookingRequired] = useState<boolean>(service?.bookingRequired ?? false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(service?.images || []);
  const [selectedImage, setSelectedImage] = useState<string | null>(service?.images?.[0] || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { types: serviceTypes, loading: typesLoading } = useServiceTypes();
  const isOtherType = serviceType === OTHER_SERVICE_TYPE;

  /**
   * The dropdown shows the approved types plus, when needed, the one this service
   * already uses. A type an owner suggested is not approved yet, so without this
   * the select would look empty on the service that asked for it.
   */
  const typeOptions = useMemo(() => {
    const list = [...serviceTypes];
    const current = service?.serviceType;
    if (current && !list.some((t) => t.name === current)) {
      list.unshift({ name: current, label: `${prettyServiceType(current)} (awaiting approval)` });
    }
    return list;
  }, [serviceTypes, service?.serviceType]);

  useEffect(() => {
    if (!isOpen || !service) return;
    setCustomType('');
    setName(service.name || '');
    setDescription(service.description || '');
    setPrice(fromSaved(service.price));
    setMrp(fromSaved(service.mrp));
    setPriceType(service.priceType || 'fixed');
    setDuration(service.duration || '');
    setServiceType(service.serviceType || '');
    setIsAvailable(service.isAvailable ?? true);
    setBookingRequired(service.bookingRequired ?? false);
    setUploadedImages(service.images || []);
    setSelectedImage(service.images?.[0] || null);
  }, [isOpen, service]);

  if (!isOpen) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages((prev) => [...prev, ...newImages]);
      if (!selectedImage) setSelectedImage(newImages[0]);
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setUploadedImages((prev) => prev.filter((img) => img !== imageToRemove));
    if (selectedImage === imageToRemove) {
      const remaining = uploadedImages.filter((img) => img !== imageToRemove);
      setSelectedImage(remaining[0] || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    if (!name.trim()) return toast.warning('Give the service a name.');
    if (!serviceType) return toast.warning('Choose a service type.');
    if (isOtherType && customType.trim().length < 2) {
      return toast.warning('Tell us what kind of service this is, e.g. Tailor or Car Wash.');
    }
    if (toNumber(price) <= 0) return toast.warning('Enter a price above zero.');

    // Send only what changed, so nothing else on the listing is disturbed.
    const updatedData: any = {};
    if (name !== service.name) updatedData.name = name;
    if (description !== service.description) updatedData.description = description;
    const priceValue = toNumber(price);
    const mrpValue = toNumber(mrp);
    if (priceValue !== service.price) updatedData.price = priceValue;
    const newMrp = mrpValue > 0 ? mrpValue : null;
    if (newMrp !== (service.mrp ?? null)) updatedData.mrp = newMrp;
    if (priceType !== service.priceType) updatedData.priceType = priceType;
    if (duration !== service.duration) updatedData.duration = duration;
    // With "Other" the typed word becomes the type, and isCustomType tells the
    // backend it is a new one being proposed rather than a typo to reject.
    const nextType = isOtherType ? customType.trim().toLowerCase() : serviceType;
    if (nextType && nextType !== service.serviceType) {
      updatedData.serviceType = nextType;
      if (isOtherType) updatedData.isCustomType = true;
    }
    if (isAvailable !== service.isAvailable) updatedData.isAvailable = isAvailable;
    if (bookingRequired !== service.bookingRequired) updatedData.bookingRequired = bookingRequired;

    const existingImages = service.images || [];
    const newImageFiles = uploadedImages.filter((img) => !existingImages.includes(img));
    const retainedImages = uploadedImages.filter((img) => existingImages.includes(img));

    try {
      setIsSubmitting(true);

      if (newImageFiles.length > 0 || retainedImages.length !== existingImages.length) {
        const newUrls = newImageFiles.length > 0 ? await uploadImagesToSupabase(newImageFiles) : [];
        updatedData.images = [...retainedImages, ...newUrls];
      }

      if (Object.keys(updatedData).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await onUpdate(updatedData);
      onClose();
    } catch (err: any) {
      console.error('Failed to update service', err);
      toast.error(err?.response?.data?.message || 'Failed to update service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="product-edit-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="product-edit-modal" onClick={(e) => e.stopPropagation()}>
        <header className="product-edit-modal-header">
          <h2>Edit Service</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close edit service modal"
          >
            <Close />
          </button>
        </header>

        <form className="product-edit-form" onSubmit={handleSubmit}>
          <div className="product-edit-grid">
            <div className="product-edit-left">
              <label className="product-edit-label">
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="product-edit-input"
                  required
                />
              </label>

              <label className="product-edit-label">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="product-edit-textarea"
                  rows={4}
                />
              </label>

              <div className="product-edit-row">
                <label className="product-edit-label">
                  Price (₹)
                  <input
                    type="number"
                    value={price}
                    min={0}
                    onChange={(e) => setPrice(readNumberField(e.target.value))}
                    className="product-edit-input"
                    placeholder="₹ 500"
                    required
                  />
                </label>

                <label className="product-edit-label">
                  Original price (₹) — optional
                  <input
                    type="number"
                    value={mrp}
                    min={0}
                    onChange={(e) => setMrp(readNumberField(e.target.value))}
                    className="product-edit-input"
                    placeholder="Leave empty if no discount"
                  />
                </label>
              </div>

              <div className="product-edit-row">
                <label className="product-edit-label">
                  Price type
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="product-edit-input"
                  >
                    {PRICE_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </label>

                <label className="product-edit-label">
                  Duration
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="product-edit-input"
                    placeholder='e.g. "30 minutes", "1 hour"'
                  />
                </label>
              </div>

              <div className="product-edit-row">
                <label className="product-edit-label">
                  Service type
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="product-edit-input"
                    disabled={typesLoading}
                    required
                  >
                    <option value="">{typesLoading ? 'Loading types...' : 'Select service type'}</option>
                    {typeOptions.map((t) => (
                      <option key={t.name} value={t.name}>{t.label}</option>
                    ))}
                    <option value={OTHER_SERVICE_TYPE}>Other — not listed</option>
                  </select>
                </label>

                {isOtherType && (
                  <label className="product-edit-label">
                    What kind of service is it?
                    <input
                      type="text"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="product-edit-input"
                      placeholder="e.g. Tailor, Car Wash"
                      maxLength={40}
                      required
                    />
                  </label>
                )}

                <label className="product-edit-label">
                  Availability
                  <select
                    value={isAvailable ? 'yes' : 'no'}
                    onChange={(e) => setIsAvailable(e.target.value === 'yes')}
                    className="product-edit-input"
                  >
                    <option value="yes">Available</option>
                    <option value="no">Unavailable</option>
                  </select>
                </label>

                <label className="product-edit-label">
                  Booking required
                  <select
                    value={bookingRequired ? 'yes' : 'no'}
                    onChange={(e) => setBookingRequired(e.target.value === 'yes')}
                    className="product-edit-input"
                  >
                    <option value="no">No (walk-in)</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="product-edit-right">
              <h3>Images</h3>
              <div className="product-edit-main-image">
                {selectedImage ? (
                  <img src={selectedImage} alt="Selected" />
                ) : (
                  <div className="product-edit-image-placeholder" onClick={() => fileInputRef.current?.click()}>
                    <AddAPhoto />
                    <p>Click to upload images</p>
                  </div>
                )}
              </div>

              <div className="product-edit-thumbnails">
                {uploadedImages.map((img) => (
                  <div
                    key={img}
                    className={`product-edit-thumbnail ${img === selectedImage ? 'selected' : ''}`}
                  >
                    <img src={img} alt="Service" onClick={() => setSelectedImage(img)} />
                    <button
                      type="button"
                      className="product-edit-remove-image"
                      onClick={() => handleRemoveImage(img)}
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="product-edit-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <AddAPhoto /> Add Images
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="product-edit-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceEditModal;
