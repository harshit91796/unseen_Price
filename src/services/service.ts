import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client

const supabaseUrl = 'https://ziruawrcztsttxzvlsuz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcnVhd3JjenRzdHR4enZsc3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5MDUyNjcsImV4cCI6MjA0MjQ4MTI2N30.YIYgAo7Z8Kb2PuLZtYYQaymdjAySWqdnzraa-0Loj20';
const supabase = createClient(supabaseUrl, supabaseKey);



export const uploadImagesToSupabase = async (images: string[]): Promise<string[]> => {
  console.log('Uploading images to Supabase:', images);
  const uploadedUrls: string[] = [];
  
  try {
    for (const image of images) {
      // Always compress images with stricter settings
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        initialQuality: 0.7,
      };

      // Show compression progress
      toast.info('Compressing image...');
      
      let fileToUpload: File;
      try {
        // Convert base64/data URL to File object
        const response = await fetch(image);
        const blob = await response.blob();
        const imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        
        fileToUpload = await imageCompression(imageFile, options);
        console.log('Compressed size:', fileToUpload.size / 1024 / 1024, 'MB');
      } catch (err: unknown) {
        console.error('Compression failed:', err);
        throw new Error(`Failed to compress image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      const uniqueFilename = `image-${uuidv4()}-${Date.now()}.jpg`;
      
      // Show upload progress
      toast.info('Uploading image...');

      const { data, error } = await supabase.storage
        .from('ghosts')
        .upload(`public/${uniqueFilename}`, fileToUpload, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Construct the correct URL
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/ghosts/${data.path}`;
      uploadedUrls.push(imageUrl);
      
      // Show success for each image
      toast.success('Image uploaded successfully');
    }

    return uploadedUrls;
  } catch (error: unknown) {
    console.error('Error in uploadImagesToSupabase:', error);
    toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};




// Helper function to check file size before upload
export const validateImageSize = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.warning(`File ${file.name} is too large (max 5MB)`);
    return false;
  }
  return true;
};