import { useState } from 'react';
import Cropper from 'react-easy-crop';

import {Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setUser } from '../../redux/user/userSlice';
import { updateUser } from '../../Api';
import { ArrowBack } from '@mui/icons-material';

import '../../styles/UploadAvatar.css';
import { uploadImagesToSupabase } from '../../services/service';

const UploadAvatar = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [coverZoom, setCoverZoom] = useState(1);
  const [activeSection, setActiveSection] = useState<'avatar' | 'cover'>('avatar');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCover(file);
    }
  };

  const handleSaveAll = async () => {
    const imagesToUpload = [];
    
    if (selectedImage) {
      imagesToUpload.push({
        file: selectedImage,
        preview: URL.createObjectURL(selectedImage),
        description: 'profile',
        id: Math.random().toString(36).substr(2, 9)
      });
    }

    if (selectedCover) {
      imagesToUpload.push({
        file: selectedCover,
        preview: URL.createObjectURL(selectedCover),
        description: 'cover',
        id: Math.random().toString(36).substr(2, 9)
      });
    }

    try {
      const urls = imagesToUpload.map(img => img.preview);
      const uploadedUrls = await uploadImagesToSupabase(urls);

      

      
      if (user?._id) {
        const updates: any = {};
        if (selectedImage) updates.profilePic = uploadedUrls[0];
        if (selectedCover) updates.coverPic = uploadedUrls[selectedImage ? 1 : 0];
        console.log(uploadedUrls , updates);
        dispatch(setUser({ ...user, ...updates }));
        await updateUser(updates);
        navigate('/');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  return (
    <div className="initial-setup-container">
      <div className="header">
        <ArrowBack className="back-button" onClick={() => navigate(-1)} style={{fontSize: '2.5rem'}}/>
        <h2>Create Your Profile</h2>
      </div>

      <div className="upload-content">
        <div className="upload-tabs">
          <button 
            className={`tab-button ${activeSection === 'avatar' ? 'active' : ''}`}
            onClick={() => setActiveSection('avatar')}
          >
            Profile Picture
          </button>
          <button 
            className={`tab-button ${activeSection === 'cover' ? 'active' : ''}`}
            onClick={() => setActiveSection('cover')}
          >
            Cover Photo
          </button>
        </div>

        {activeSection === 'avatar' ? (
          <div className="section-container">
            <p className="upload-description">
              Add a profile picture to make your profile more personable.
            </p>
            <div className="avatar-upload-container">
              {!selectedImage ? (
                <div className="upload-placeholder">
                  <label htmlFor="avatar-upload" className="upload-button">
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </div>
                    <span>Choose profile photo</span>
                  </label>
                </div>
              ) : (
                <div className="cropper-wrapper">
                  <Cropper
                    image={URL.createObjectURL(selectedImage)}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    cropShape="round"
                    showGrid={false}
                  />
                  <div className="zoom-controls">
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="section-container">
            <p className="upload-description">
              Add a cover photo to personalize your profile page.
            </p>
            <div className="cover-upload-container">
              {!selectedCover ? (
                <div className="upload-placeholder cover">
                  <label htmlFor="cover-upload" className="upload-button">
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </div>
                    <span>Choose cover photo</span>
                  </label>
                </div>
              ) : (
                <div className="cropper-wrapper">
                  <Cropper
                    image={URL.createObjectURL(selectedCover)}
                    crop={coverCrop}
                    zoom={coverZoom}
                    aspect={16/5}
                    onCropChange={setCoverCrop}
                    onZoomChange={setCoverZoom}
                    showGrid={false}
                  />
                  <div className="zoom-controls">
                    <input
                      type="range"
                      value={coverZoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setCoverZoom(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="actions">
          {(selectedImage || selectedCover) && (
            <button className="primary-button" onClick={handleSaveAll}>
              Save Changes
            </button>
          )}
          <Link to="/" className="skip-link">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
};

// const createImage = (url: string): Promise<HTMLImageElement> => {
//   return new Promise((resolve, reject) => {
//     const image = new Image();
//     image.addEventListener('load', () => resolve(image));
//     image.addEventListener('error', (error) => reject(error));
//     image.setAttribute('crossOrigin', 'anonymous');
//     image.src = url;
//   });
// };

export default UploadAvatar;
