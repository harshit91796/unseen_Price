import React from 'react';
import { LocationOn } from '@mui/icons-material';
import SponsoredTag from '../AdTags/SponsoredTag';
import SafeImage from '../SafeImage/SafeImage';
import './InlineAdCard.css';

interface AdLike {
  _id: string;
  title?: string;
  description?: string;
  images?: string[];
  link?: string;
  targeting?: {
    targetType?: 'CITY' | 'STATE' | 'GLOBAL';
    city?: string;
    state?: string;
  };
}

interface InlineAdCardProps {
  ad: AdLike;
  /** Optional dismiss callback — when present, an X appears on hover. */
  onDismiss?: (adId: string) => void;
  /** Visual style — 'shop' looks like a shop card, 'service' like a service card. */
  variant?: 'shop' | 'service' | 'product';
}

/**
 * Native inline ad — looks like a regular shop/product/service card in the search
 * grid but is clearly labelled SPONSORED. Used to blend ads into the search results
 * without disrupting visual flow.
 */
const InlineAdCard: React.FC<InlineAdCardProps> = ({ ad, onDismiss, variant = 'shop' }) => {
  const locationText = ad.targeting?.targetType === 'GLOBAL'
    ? 'Available Everywhere'
    : ad.targeting?.targetType === 'STATE'
    ? `Available in ${ad.targeting?.state || ''}`
    : `Available in ${ad.targeting?.city || ''}`;

  return (
    <div className={`inline-ad-card variant-${variant}`}>
      <SponsoredTag />
      {onDismiss && (
        <button
          type="button"
          className="inline-ad-dismiss"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDismiss(ad._id);
          }}
          aria-label="Hide this ad"
          title="Don't show this ad again today"
        >
          ×
        </button>
      )}
      <a
        href={ad.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-ad-link"
      >
        <SafeImage
          src={ad.images?.[0]}
          alt={ad.title || 'Sponsored'}
          className="inline-ad-image"
          preset="CARD"
        />
        <div className="inline-ad-info">
          <h3>{ad.title || 'Sponsored business'}</h3>
          {ad.description && <p className="inline-ad-desc">{ad.description}</p>}
          <p className="inline-ad-location">
            <LocationOn fontSize="small" />
            <span>{locationText}</span>
          </p>
        </div>
      </a>
    </div>
  );
};

export default InlineAdCard;
