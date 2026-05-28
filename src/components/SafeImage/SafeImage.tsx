import React, { useState, useEffect, ImgHTMLAttributes } from 'react';
import {
  getOptimizedImageUrl,
  ImagePresets,
  ImageOptions,
  PLACEHOLDER_IMAGE_DATA_URL
} from '../../utils/imageHelpers';

type Preset = keyof typeof ImagePresets;

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string | undefined | null;
  alt: string;
  /** Use a built-in size preset (THUMB / CARD / HERO / AD). */
  preset?: Preset;
  /** Custom transformation options (overrides preset). */
  imageOptions?: ImageOptions;
  /** Custom fallback URL. Defaults to inline SVG placeholder. */
  fallback?: string;
  /** Whether to lazy load. Default true. Set false for above-the-fold hero images. */
  lazy?: boolean;
}

/**
 * Drop-in replacement for <img> with:
 *  - lazy loading by default
 *  - automatic error fallback (no broken-image icon)
 *  - optional Supabase image transformation for size/format
 *
 * Usage:
 *   <SafeImage src={shop.images[0]} alt={shop.name} preset="CARD" />
 *   <SafeImage src={hero} alt="..." preset="HERO" lazy={false} />
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  preset,
  imageOptions,
  fallback = PLACEHOLDER_IMAGE_DATA_URL,
  lazy = true,
  ...rest
}) => {
  const opts = imageOptions || (preset ? ImagePresets[preset] : undefined);
  const optimizedSrc = getOptimizedImageUrl(src, opts) || fallback;

  const [currentSrc, setCurrentSrc] = useState<string>(optimizedSrc);
  const [errored, setErrored] = useState(false);

  // Re-sync when src prop changes (e.g., user navigates to a new shop)
  useEffect(() => {
    setCurrentSrc(getOptimizedImageUrl(src, opts) || fallback);
    setErrored(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleError = () => {
    if (errored) return; // already on fallback
    setErrored(true);
    // First fallback: try the original (un-optimized) URL.
    // If that's the same as currentSrc, jump straight to placeholder.
    if (src && src !== currentSrc) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc(fallback);
    }
  };

  return (
    <img
      {...rest}
      src={currentSrc}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onError={handleError}
    />
  );
};

export default SafeImage;
