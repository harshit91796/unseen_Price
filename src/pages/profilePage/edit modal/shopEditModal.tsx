import React, { useState, useRef, useEffect } from 'react';
import './shopEditModal.css';
import { Close, AddAPhoto, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { uploadImagesToSupabase } from '../../../services/service';

interface ShopEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopDetails: any;
  onUpdate: (updatedData: any) => Promise<void>;
}

const ShopEditModal: React.FC<ShopEditModalProps> = ({
  isOpen,
  onClose,
  shopDetails,
  onUpdate
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(shopDetails?.images || []);
  const [name, setName] = useState(shopDetails?.name || '');
  const [isActive, setIsActive] = useState(shopDetails?.isActive || false);
  const [contact, setContact] = useState(shopDetails?.contact || '');
  const [address, setAddress] = useState(shopDetails?.address?.city || '');
  const [openTime, setOpenTime] = useState(shopDetails?.openTime || '');
  const [closeTime, setCloseTime] = useState(shopDetails?.closeTime || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadedImages(shopDetails?.images || []);
    setName(shopDetails?.name || '');
    setIsActive(shopDetails?.isActive || false);
    setContact(shopDetails?.contact || '');
    setAddress(shopDetails?.address?.city || '');
    setOpenTime(shopDetails?.openTime || '');
    setCloseTime(shopDetails?.closeTime || '');
  }, [shopDetails]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedData: any = {};
      
      if (name !== shopDetails?.name) updatedData.name = name;
      if (contact !== shopDetails?.contact) updatedData.contact = contact;
      if (address !== shopDetails?.address?.city) updatedData.address = { city: address };
      if (isActive !== shopDetails?.isActive) updatedData.isActive = isActive;
      if (openTime !== shopDetails?.openTime) updatedData.openTime = openTime;
      if (closeTime !== shopDetails?.closeTime) updatedData.closeTime = closeTime;
      
      const existingImages = shopDetails?.images || [];
      const newImageFiles = uploadedImages.filter(img => !existingImages.includes(img));
      const retainedImages = uploadedImages.filter(img => existingImages.includes(img));

      if (newImageFiles.length > 0 || retainedImages.length !== existingImages.length) {
        console.log("newImageFiles", newImageFiles);
        console.log("retainedImages", retainedImages);
        console.log("existingImages", existingImages);
        const newUploadedImageUrls = newImageFiles.length > 0 
          ? await uploadImagesToSupabase(newImageFiles)
          : [];

        updatedData.images = [...retainedImages, ...newUploadedImageUrls];
      }

      console.log("updatedData", updatedData);

      if (Object.keys(updatedData).length > 0) {
        await onUpdate(updatedData);
        toast.success('Shop details updated successfully');
        onClose();
      } else {
        toast.info('No changes were made');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to update shop details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter shop name"
                  // required
                />
              </div>


            <div className='form-section details-section'>

            <div className="form-group">
                <label>Active status</label>
                <select
                  value={shopDetails?.isActive ? 'Active' : 'Inactive'}
                  
                  onChange={(e) => setIsActive(e.target.value === 'Active')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>


              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Enter contact number"
                  // required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter shop address"
                  // required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    // required
                  />
                </div>

                <div className="form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    // required
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
