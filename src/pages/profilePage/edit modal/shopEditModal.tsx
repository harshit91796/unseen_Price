import React, { useState, useRef, useEffect } from 'react';
import './shopEditModal.css';
import { Close, AddAPhoto, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { uploadImagesToSupabase } from '../../../services/service';
import LocationPicker, { PickedLocation } from '../../../components/LocationPicker/LocationPicker';

/**
 * Edit an existing shop.
 *
 * This form used to offer a single box labelled "Address" that read and wrote
 * `address.city` and nothing else, so an owner could never enter their street or
 * pincode, and there was no way at all to set the map pin. Every shop created
 * before the Add form got a map is therefore sitting without coordinates, which
 * means it cannot appear in any nearby search — and its owner had no way to fix
 * that. One owner pasted a Google Maps link into the city box because there was
 * nowhere else for a location to go.
 *
 * `contact` was also mishandled: it is an object of { phone, email }, but the old
 * form bound the whole object to a text input. The box rendered "[object Object]"
 * and saving sent a bare string, which the server now rejects outright.
 */

interface ShopEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopDetails: any;
  onUpdate: (updatedData: any) => Promise<void>;
}

const emptyAddress = { street: '', city: '', state: '', zipCode: '', country: 'India' };

/** A pin at 0,0 is the Atlantic Ocean — treat it as "never set". */
const readCoordinates = (raw: any): [number, number] | null => {
  if (!Array.isArray(raw) || raw.length !== 2) return null;
  const [lng, lat] = raw.map(Number);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (lng === 0 && lat === 0) return null;
  return [lng, lat];
};

/** Older shops stored contact as a bare string. Read both shapes. */
const readContact = (raw: any) => {
  if (raw && typeof raw === 'object') {
    return { phone: raw.phone || '', email: raw.email || '' };
  }
  return { phone: typeof raw === 'string' ? raw : '', email: '' };
};

const ShopEditModal: React.FC<ShopEditModalProps> = ({
  isOpen,
  onClose,
  shopDetails,
  onUpdate
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(shopDetails?.images || []);
  const [name, setName] = useState(shopDetails?.name || '');
  const [isActive, setIsActive] = useState(shopDetails?.isActive ?? true);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState({ ...emptyAddress });
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [openTime, setOpenTime] = useState(shopDetails?.openTime || '');
  const [closeTime, setCloseTime] = useState(shopDetails?.closeTime || '');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadedImages(shopDetails?.images || []);
    setName(shopDetails?.name || '');
    setIsActive(shopDetails?.isActive ?? true);

    const contact = readContact(shopDetails?.contact);
    setPhone(contact.phone);
    setEmail(contact.email);

    const saved = shopDetails?.address || {};
    setAddress({
      street: saved.street || '',
      city: saved.city || '',
      state: saved.state || '',
      zipCode: saved.zipCode || '',
      country: saved.country || 'India'
    });

    setCoordinates(readCoordinates(shopDetails?.targeting?.coordinates));
    setOpenTime(shopDetails?.openTime || '');
    setCloseTime(shopDetails?.closeTime || '');
    setFormError('');
  }, [shopDetails]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const setAddressField = (field: keyof typeof emptyAddress, value: string) =>
    setAddress(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // The same rules the server applies when a shop is created. Checking here
    // means the owner reads why, rather than a generic "failed to update".
    const phoneDigits = phone.replace(/\D/g, '');
    const problem =
      !name.trim() ? 'Enter your shop name.' :
      phoneDigits.length < 7 ? 'Add a phone number customers can call.' :
      !coordinates ? 'Set your location on the map — without a pin your shop cannot appear in any nearby search.' :
      '';

    if (problem) {
      setFormError(problem);
      toast.error(problem);
      return;
    }
    // Unreachable — the check above already returns without a pin. Written out
    // so the compiler can narrow the type for the rest of this function.
    if (!coordinates) return;

    setIsSubmitting(true);

    try {
      const updatedData: any = {};

      if (name !== shopDetails?.name) updatedData.name = name;
      if (isActive !== shopDetails?.isActive) updatedData.isActive = isActive;
      if (openTime !== shopDetails?.openTime) updatedData.openTime = openTime;
      if (closeTime !== shopDetails?.closeTime) updatedData.closeTime = closeTime;

      // Always an object. The old form sent whatever was in one text box.
      const savedContact = readContact(shopDetails?.contact);
      if (phone.trim() !== savedContact.phone || email.trim() !== savedContact.email) {
        updatedData.contact = { phone: phone.trim(), email: email.trim() };
      }

      const savedAddress = shopDetails?.address || {};
      const addressChanged = (Object.keys(emptyAddress) as Array<keyof typeof emptyAddress>)
        .some(key => (address[key] || '') !== (savedAddress[key] || ''));
      if (addressChanged) updatedData.address = address;

      // targeting carries the pin the nearby search reads, plus a copy of the
      // place names. The server merges it, so the existing type stays intact.
      const savedCoordinates = readCoordinates(shopDetails?.targeting?.coordinates);
      const pinMoved = !savedCoordinates
        || savedCoordinates[0] !== coordinates[0]
        || savedCoordinates[1] !== coordinates[1];
      if (pinMoved || addressChanged) {
        updatedData.targeting = {
          type: 'Point',
          coordinates,
          city: address.city,
          state: address.state,
          country: address.country
        };
      }

      const existingImages = shopDetails?.images || [];
      const newImageFiles = uploadedImages.filter(img => !existingImages.includes(img));
      const retainedImages = uploadedImages.filter(img => existingImages.includes(img));

      if (newImageFiles.length > 0 || retainedImages.length !== existingImages.length) {
        const newUploadedImageUrls = newImageFiles.length > 0
          ? await uploadImagesToSupabase(newImageFiles)
          : [];

        updatedData.images = [...retainedImages, ...newUploadedImageUrls];
      }

      if (Object.keys(updatedData).length > 0) {
        await onUpdate(updatedData);
        toast.success('Shop details updated successfully');
        onClose();
      } else {
        toast.info('No changes were made');
        onClose();
      }
    } catch (error: any) {
      // The server explains exactly which rule failed; show that instead.
      const message = error?.response?.data?.message || 'Failed to update shop details';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const missingPin = !readCoordinates(shopDetails?.targeting?.coordinates);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Shop Details</h2>
          <button className="close-button" onClick={onClose}>
            <Close />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            {/* Shop Images */}
            <div className="form-section images-section">
              <h3>Shop Images</h3>
              <div className="images-grid">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image} alt={`Shop ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Close />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-image-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddAPhoto />
                  <span>Add Image</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            {/* Shop Details */}
            <div className="form-section details-section">
              {formError && <p className="shop-edit-error">{formError}</p>}

              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter shop name"
                />
              </div>

              <div className="form-group">
                <label>Active status</label>
                <select
                  value={isActive ? 'Active' : 'Inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'Active')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 98765 43210"
                  />
                </div>

                <div className="form-group">
                  <label>Email <span className="shop-edit-optional">(optional)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shop@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Shop location</label>
                {missingPin && (
                  <p className="shop-edit-hint">
                    This shop has no location pin yet, so it does not show up when
                    customers search nearby. Search for your address below, or drag
                    the pin to your door.
                  </p>
                )}
                <LocationPicker
                  value={{ coordinates, address }}
                  onChange={(next: PickedLocation) => {
                    setCoordinates(next.coordinates);
                    setAddress(prev => ({ ...prev, ...next.address }));
                  }}
                />
              </div>

              <div className="form-group">
                <label>Street / building</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddressField('street', e.target.value)}
                  placeholder="Shop no, building, road"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddressField('city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddressField('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => setAddressField('zipCode', e.target.value)}
                    placeholder="462002"
                    maxLength={10}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => setAddressField('country', e.target.value)}
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopEditModal;
