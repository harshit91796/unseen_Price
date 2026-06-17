import React from 'react';
import './SponsoredTag.css';

interface SponsoredTagProps {
  /** Visual variant — light tag works on dark images, dark tag on light bg */
  variant?: 'overlay' | 'light';
  className?: string;
}

/**
 * Tiny "SPONSORED" pill shown on every ad placement.
 *
 * Required for trust + legal disclosure (ASCI guidelines + Indian consumer
 * protection rules). Place inside a position:relative parent.
 */
const SponsoredTag: React.FC<SponsoredTagProps> = ({ variant = 'overlay', className }) => {
  return (
    <span className={`sponsored-tag ${variant} ${className || ''}`}>
      SPONSORED
    </span>
  );
};

export default SponsoredTag;
