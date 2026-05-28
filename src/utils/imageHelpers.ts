/**
 * Image helpers — generates optimized image URLs using Supabase image transformations.
 *
 * Supabase image transformations (auto-resize + format conversion) are only available
 * on Pro plans. To enable, set VITE_USE_IMAGE_TRANSFORMATIONS=true in .env after upgrading.
 * Until then, this util returns the original URL (no harm done).
 *
 * URL format with transformations:
 *   /storage/v1/render/image/public/<bucket>/<path>?width=400&format=webp&quality=70
 *
 * URL format without (default):
 *   /storage/v1/object/public/<bucket>/<path>
 */

const USE_TRANSFORMATIONS = ((import.meta as any).env?.VITE_USE_IMAGE_TRANSFORMATIONS === 'true');
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;          // 1-100, default 70
  format?: 'webp' | 'jpg' | 'png' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Common size presets for consistent rendering across the app.
 * Use these instead of passing arbitrary dimensions.
 */
export const ImagePresets = {
  // small thumbnail in lists, profile pictures
  THUMB: { width: 150, height: 150, format: 'webp' as const, quality: 70, resize: 'cover' as const },
  // search-result and grid cards
  CARD: { width: 400, height: 400, format: 'webp' as const, quality: 75, resize: 'cover' as const },
  // banner/hero on detail pages
  HERO: { width: 1080, format: 'webp' as const, quality: 80 },
  // ad sidebar
  AD: { width: 300, format: 'webp' as const, quality: 75 }
};

/**
 * Build a transformed Supabase URL or fall back to the original.
 * Non-Supabase URLs are returned unchanged.
 */
export const getOptimizedImageUrl = (url: string | undefined | null, opts?: ImageOptions): string => {
  if (!url) return '';

  // Don't transform non-Supabase URLs (placeholders, external imgs, etc.)
  if (!url.includes('/storage/v1/object/public/')) return url;

  // Transformations disabled — return original
  if (!USE_TRANSFORMATIONS || !opts) return url;

  // Build query string from supplied options
  const params: string[] = [];
  if (opts.width) params.push(`width=${opts.width}`);
  if (opts.height) params.push(`height=${opts.height}`);
  if (opts.quality) params.push(`quality=${opts.quality}`);
  if (opts.format && opts.format !== 'origin') params.push(`format=${opts.format}`);
  if (opts.resize) params.push(`resize=${opts.resize}`);

  if (params.length === 0) return url;

  // Switch endpoint from /object/public/ to /render/image/public/
  const transformed = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}${params.join('&')}`;
};

/**
 * Convenience wrappers for common presets.
 */
export const thumbUrl = (url: string | undefined | null) => getOptimizedImageUrl(url, ImagePresets.THUMB);
export const cardUrl = (url: string | undefined | null) => getOptimizedImageUrl(url, ImagePresets.CARD);
export const heroUrl = (url: string | undefined | null) => getOptimizedImageUrl(url, ImagePresets.HERO);
export const adUrl = (url: string | undefined | null) => getOptimizedImageUrl(url, ImagePresets.AD);

/**
 * Default placeholder for broken / missing images.
 * Inline SVG = no extra network request, no broken-image icon.
 */
export const PLACEHOLDER_IMAGE_DATA_URL =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Cpath d='M200 130c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40zm0 65c-14 0-25-11-25-25s11-25 25-25 25 11 25 25-11 25-25 25z' fill='%23d1d5db'/%3E%3Cpath d='M280 270H120c-6 0-10-4-10-10v-120c0-6 4-10 10-10h160c6 0 10 4 10 10v120c0 6-4 10-10 10zm-150-20h140v-100H130v100z' fill='%23d1d5db'/%3E%3Ctext x='200' y='320' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3EImage unavailable%3C/text%3E%3C/svg%3E";
