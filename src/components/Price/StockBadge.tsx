import React from 'react';
import './PriceDisplay.css';

interface StockBadgeProps {
  /** Quantity in stock. Pass undefined/null if stock isn't tracked. */
  stock?: number | null;
  /** Whether the product is available — overrides stock. */
  isAvailable?: boolean;
  /** Threshold below which we show "Only X left" urgency. Default 10. */
  lowStockThreshold?: number;
}

const StockBadge: React.FC<StockBadgeProps> = ({
  stock,
  isAvailable,
  lowStockThreshold = 10
}) => {
  if (isAvailable === false) {
    return <span className="stock-badge out">Out of stock</span>;
  }
  if (stock == null) {
    return <span className="stock-badge in">In stock</span>;
  }
  if (stock <= 0) {
    return <span className="stock-badge out">Out of stock</span>;
  }
  if (stock <= lowStockThreshold) {
    return <span className="stock-badge low">Only {stock} left</span>;
  }
  return <span className="stock-badge in">In stock</span>;
};

export default StockBadge;
