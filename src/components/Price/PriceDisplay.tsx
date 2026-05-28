import React from 'react';
import { computeDiscount, formatINR } from '../../utils/priceHelpers';
import './PriceDisplay.css';

interface PriceDisplayProps {
  price: number | undefined | null;
  mrp?: number | null;
  /** 'card' is compact (for grids); 'detail' is large (for detail pages). */
  variant?: 'card' | 'detail';
  /** Optional suffix shown after the price, e.g. "/ hr" for hourly services. */
  suffix?: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  mrp,
  variant = 'card',
  suffix,
  className
}) => {
  const d = computeDiscount(price, mrp);

  return (
    <div className={`price-display ${variant} ${className || ''}`}>
      <span className="price-current">{formatINR(d.price)}</span>
      {suffix && <span className="price-suffix">{suffix}</span>}
      {d.hasDiscount && (
        <>
          <span className="price-mrp">{formatINR(d.mrp)}</span>
          <span className="price-discount">{d.discountPercent}% OFF</span>
        </>
      )}
      {variant === 'detail' && d.hasDiscount && (
        <div className="price-savings">You save {formatINR(d.savings)}</div>
      )}
    </div>
  );
};

export default PriceDisplay;
