import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// Supabase client (keys from .env)
// ==========================================
// IMPORTANT: set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in your .env file.
// Falls back to old hardcoded values during transition; remove fallbacks once .env is set up.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_KEY
  

const SUPABASE_BUCKET = 'unseen_price';

export const supabase = createClient(supabaseUrl, supabaseKey);
export { supabaseUrl, SUPABASE_BUCKET };

// ==========================================
// Validation rules
// ==========================================
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB raw cap (compressed to 0.5MB)
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  initialQuality: 0.7
};

// ==========================================
// Helpers
// ==========================================

/**
 * Validate a File against type and size rules.
 * Throws with a user-friendly message if invalid.
 */
export const validateImageFile = (file: File): void => {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type "${file.type || 'unknown'}". Only JPEG, PNG, WebP, and GIF images are allowed.`);
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 10MB.`);
  }
};

/**
 * Convert a blob URL or data URL back into a File, preserving its MIME type.
 */
const blobUrlToFile = async (url: string, fallbackName = 'upload'): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const ext = EXTENSION_BY_MIME[blob.type] || 'bin';
  return new File([blob], `${fallbackName}.${ext}`, { type: blob.type });
};

/**
 * Revoke a blob URL safely (no-op for http URLs).
 */
export const safeRevokeBlobUrl = (url: string): void => {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }
};

// ==========================================
// Single image upload (with retry)
// ==========================================
export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
  originalUrl: string;
}

const uploadOneImage = async (image: string, retries = 2): Promise<UploadResult> => {
  let lastError: Error | undefined;

  // Convert blob/data URL to File
  let file: File;
  try {
    file = await blobUrlToFile(image);
    validateImageFile(file);
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Invalid file', originalUrl: image };
  }

  // Compress (preserves MIME type roughly; output is determined by browser-image-compression)
  let compressed: File;
  try {
    compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  } catch (err: any) {
    return { ok: false, error: `Compression failed: ${err?.message || 'unknown'}`, originalUrl: image };
  }

  // Decide extension + content type AFTER compression based on the resulting blob
  const finalMime = compressed.type && ALLOWED_MIME_TYPES.has(compressed.type) ? compressed.type : file.type;
  const ext = EXTENSION_BY_MIME[finalMime] || 'jpg';
  const filename = `image-${uuidv4()}-${Date.now()}.${ext}`;
  const path = `public/${filename}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, compressed, {
          cacheControl: '3600',
          upsert: false,
          contentType: finalMime
        });

      if (error) {
        lastError = new Error(error.message);
        // Don't retry on 409 (file already exists with upsert:false) or 4xx
        if (/already exists|invalid|forbidden/i.test(error.message)) break;
        // Otherwise wait and retry
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        break;
      }

      const url = `${supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${data.path}`;
      return { ok: true, url, originalUrl: image };
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  return { ok: false, error: lastError?.message || 'Upload failed after retries', originalUrl: image };
};

// ==========================================
// Public API: parallel multi-image upload
// ==========================================
/**
 * Upload many images in parallel. Returns ONLY the successfully uploaded URLs
 * but logs and toasts per-image failures.
 *
 * Original blob URLs are revoked after their upload completes (success or fail)
 * to free memory.
 */
export const uploadImagesToSupabase = async (images: string[]): Promise<string[]> => {
  if (!images || images.length === 0) return [];

  const toastId = toast.info(`Uploading ${images.length} image${images.length > 1 ? 's' : ''}...`, { autoClose: false });

  const results = await Promise.allSettled(images.map(img => uploadOneImage(img)));

  // Revoke original blob URLs to free memory (regardless of success/fail)
  images.forEach(safeRevokeBlobUrl);

  toast.dismiss(toastId);

  const succeeded: string[] = [];
  let failedCount = 0;
  const failures: string[] = [];

  results.forEach((r) => {
    if (r.status === 'fulfilled' && r.value.ok && r.value.url) {
      succeeded.push(r.value.url);
    } else {
      failedCount++;
      const reason = r.status === 'fulfilled' ? r.value.error : (r.reason?.message || 'unknown');
      if (reason) failures.push(reason);
      console.error('Image upload failed:', reason);
    }
  });

  if (failedCount > 0) {
    const sample = failures[0] ? ` (${failures[0]})` : '';
    toast.error(`${failedCount} of ${images.length} image${images.length > 1 ? 's' : ''} failed to upload${sample}`);
  }
  if (succeeded.length > 0 && failedCount === 0) {
    toast.success(`${succeeded.length} image${succeeded.length > 1 ? 's' : ''} uploaded`);
  }

  return succeeded;
};

/**
 * Detailed variant — returns per-image results (for callers that want to retry failures).
 */
export const uploadImagesDetailed = async (images: string[]): Promise<UploadResult[]> => {
  if (!images || images.length === 0) return [];
  const results = await Promise.allSettled(images.map(img => uploadOneImage(img)));
  images.forEach(safeRevokeBlobUrl);
  return results.map((r, i) => r.status === 'fulfilled'
    ? r.value
    : { ok: false, error: r.reason?.message || 'unknown', originalUrl: images[i] });
};

// ==========================================
// Pre-flight validation for File inputs
// ==========================================
/**
 * Validate a File before creating a blob URL preview.
 * Returns true if valid, false (and shows toast) if not.
 */
export const validateImageSize = (file: File): boolean => {
  try {
    validateImageFile(file);
    return true;
  } catch (err: any) {
    toast.warning(err.message);
    return false;
  }
};
