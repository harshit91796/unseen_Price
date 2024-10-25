import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setUser } from '../../redux/user/userSlice';
import { updateUser } from '../../Api';
const supabaseUrl = 'https://ziruawrcztsttxzvlsuz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcnVhd3JjenRzdHR4enZsc3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5MDUyNjcsImV4cCI6MjA0MjQ4MTI2N30.YIYgAo7Z8Kb2PuLZtYYQaymdjAySWqdnzraa-0Loj20';
const supabase = createClient(supabaseUrl, supabaseKey);

const UploadAvatar = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const onCropComplete = useCallback((_: unknown, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async ( imageSrc: string, pixelCrop: any) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    if (ctx) {
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
    } else {
      console.error('Canvas context is null');
    }

    return new Promise((resolve: any) => {
      canvas.toBlob((blob: any) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/jpeg');
    });
  };

  const handleImageUploadToSupabase = async () => {
    if (croppedAreaPixels && selectedImage) {
      try {
        const croppedImageUrl = await getCroppedImg(URL.createObjectURL(selectedImage), croppedAreaPixels);
        setCroppedImageUrl(croppedImageUrl as string);

        const response = await fetch(croppedImageUrl as string);
        const blob = await response.blob();
        const uniqueFilename = `avatar-${uuidv4()}.jpg`;
        const file = new File([blob], uniqueFilename, { type: 'image/jpeg' });

        const { data, error } = await supabase.storage
        .from('ghosts')
        .upload(`profilePic/${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading image:', error);
      } else {
        console.log('Image uploaded to Supabase:', data);
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/ghosts/${data.path}`;
        console.log('Image uploaded to Supabase:', imageUrl);
        
        if (user) {
          dispatch(setUser({ ...user, profilePic: imageUrl }));
          await updateUser({ profilePic: imageUrl });
        } else {
          console.error('User is null, cannot update profile picture');
        }
        
        navigate('/');

        setCroppedImageUrl(null);
      
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    } else {
      console.log('Cropped area pixels or selected image is missing');
    }
  };

  return (
    <div className="initial-setup">
      <h2>Upload Your Avatar</h2>
      <p>A profile picture goes a long way in making your profile approachable. Upload one to stand out.</p>
      <div className='avatar-container'>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {selectedImage && (
          <div className="crop-container">
            <Cropper
              image={URL.createObjectURL(selectedImage)}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            
          </div>
        )}
        {croppedImageUrl && (
          <div>
            <img src={croppedImageUrl} alt="Cropped" />
          </div>
        )}
      </div>
      {selectedImage && (
        <button style={{backgroundColor : '#000', color : '#fff', padding : '10px 20px', borderRadius : '5px', border : 'none', cursor : 'pointer' }} type="button" onClick={handleImageUploadToSupabase}>Upload Image</button>
      )}
      <span className="gspan"><Link to='/setup'>I'll do it later</Link></span>
    </div>
  );
};

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
};

export default UploadAvatar;
