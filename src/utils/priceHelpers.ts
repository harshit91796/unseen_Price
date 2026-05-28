/**
 * Pricing display helpers — turn raw price + mrp values into UI-ready data.
 */

export interface PriceDisplay {
  price: number;
  mrp: number | null;
  hasDiscount: boolean;
  discountPercent: number;       // rounded integer 0-100
  savings: number;                // in rupees
}

/**
 * Compute discount + savings from a price and optional MRP.
 * If MRP is missing or <= price, no discount is shown.
 */
export const computeDiscount = (
  price: number | undefined | null,
  mrp: number | undefined | null
): PriceDisplay => {
  const p = Number(price) || 0;
  const m = mrp != null && Number(mrp) > 0 ? Number(mrp) : null;
  if (!m || m <= p) {
    return { price: p, mrp: null, hasDiscount: false, discountPercent: 0, savings: 0 };
  }
  const savings = m - p;
  const discountPercent = Math.round((savings / m) * 100);
  return { price: p, mrp: m, hasDiscount: true, discountPercent, savings };
};

/**
 * Format a number as INR currency without showing 0 decimals.
 *   299    → "₹299"
 *   1599.5 → "₹1,599.50"
 *   1599   → "₹1,599"
 */
export const formatINR = (n: number | undefined | null): string => {
  if (n == null || isNaN(Number(n))) return '₹0';
  const num = Number(n);
  const hasDecimals = num % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: hasDecimals ? 2 : 0,
    minimumFractionDigits: hasDecimals ? 2 : 0
  }).format(num);
};
