/**
 * Pricing and stock helpers.
 *
 * Single source of truth for how MRP/discount/stock are displayed across the app.
 * Use these instead of computing inline in components.
 */

export interface VariantLike {
  size?: string | null;
  color?: string | null;
  price: number;
  mrp?: number | null;
  stock?: number;
}

export interface PriceInfo {
  price: number;
  mrp: number | null;
  discountPercent: number | null;   // null if no discount or MRP missing
  hasDiscount: boolean;
}

/** Build a PriceInfo from raw values. */
export const computePriceInfo = (price: number, mrp?: number | null): PriceInfo => {
  const validMrp = typeof mrp === 'number' && mrp > 0 && mrp > price ? mrp : null;
  if (!validMrp) {
    return { price, mrp: null, discountPercent: null, hasDiscount: false };
  }
  const discount = Math.round(((validMrp - price) / validMrp) * 100);
  return { price, mrp: validMrp, discountPercent: discount, hasDiscount: discount > 0 };
};

/**
 * Compute the display price range for a product that has variants.
 * Returns { minPrice, maxPrice, hasRange, lowestMrp } so a card can show "From ₹499" + savings.
 */
export const computeVariantPriceRange = (variants: VariantLike[] = []) => {
  if (!variants || variants.length === 0) {
    return { minPrice: 0, maxPrice: 0, hasRange: false, lowestMrp: null as number | null };
  }
  const prices = variants.map(v => v.price).filter(p => typeof p === 'number');
  const mrps = variants.map(v => v.mrp).filter((m): m is number => typeof m === 'number' && m > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const lowestMrp = mrps.length > 0 ? Math.min(...mrps) : null;
  return {
    minPrice,
    maxPrice,
    hasRange: minPrice !== maxPrice,
    lowestMrp
  };
};

/**
 * Returns the best display price + MRP for a product (handles both
 * variant and non-variant cases).
 */
export const productDisplayPrice = (product: {
  price?: number;
  mrp?: number | null;
  variants?: VariantLike[];
}): { price: number; mrp: number | null; isFrom: boolean; range?: [number, number] } => {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const { minPrice, maxPrice, lowestMrp, hasRange } = computeVariantPriceRange(product.variants);
    return {
      price: minPrice,
      mrp: lowestMrp,
      isFrom: true,
      range: hasRange ? [minPrice, maxPrice] : undefined
    };
  }
  return {
    price: product.price || 0,
    mrp: typeof product.mrp === 'number' ? product.mrp : null,
    isFrom: false
  };
};

/** Stock band for UI badge color/text. */
export type StockBand = 'in_stock' | 'low' | 'out_of_stock' | 'unknown';

export const stockBand = (stock: number | undefined | null): StockBand => {
  if (stock === undefined || stock === null) return 'unknown';
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 10) return 'low';
  return 'in_stock';
};

export const stockLabel = (stock: number | undefined | null): string => {
  const band = stockBand(stock);
  if (band === 'out_of_stock') return 'Out of stock';
  if (band === 'low') return `Only ${stock} left`;
  if (band === 'in_stock') return 'In stock';
  return '';
};

/**
 * For products with variants, total stock = sum of variant stocks.
 * For products without variants, falls back to product.stock.
 */
export const totalStock = (product: { stock?: number; variants?: VariantLike[] }): number => {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock || 0;
};

/** Available sizes from variants (de-duplicated, preserves order). */
export const availableSizes = (variants: VariantLike[] = []): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    const s = v.size || '';
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
};

/** Available colors for a given size (or all colors if no size filter). */
export const availableColors = (variants: VariantLike[] = [], size?: string): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    if (size && v.size !== size) continue;
    const c = v.color || '';
    if (c && !seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
};

/** Find the matching variant given a size+color selection. */
export const findVariant = (
  variants: VariantLike[] = [],
  size?: string,
  color?: string
): VariantLike | null => {
  return variants.find(v =>
    (size ? v.size === size : true) &&
    (color ? v.color === color : true)
  ) || null;
};
