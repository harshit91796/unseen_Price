import React, { useEffect, useMemo, useState } from 'react';
import {
  VariantLike,
  availableSizes,
  availableColors,
  findVariant,
  stockBand,
  stockLabel,
  computePriceInfo
} from '../../utils/pricing';
import './VariantPicker.css';

interface VariantPickerProps {
  variants: VariantLike[];
  /** Called when the user's selection produces a complete variant match. */
  onChange?: (variant: VariantLike | null) => void;
}

/**
 * Customer-facing variant picker. Renders size and color chips,
 * disables combinations that don't exist or are out of stock,
 * and broadcasts the matched variant via onChange.
 */
const VariantPicker: React.FC<VariantPickerProps> = ({ variants, onChange }) => {
  const sizes = useMemo(() => availableSizes(variants), [variants]);
  const allColors = useMemo(() => availableColors(variants), [variants]);

  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState<string | null>(allColors.length === 1 ? allColors[0] : null);

  // When user picks a size, narrow colors to those available for it
  const colorsForSize = useMemo(() => availableColors(variants, size || undefined), [variants, size]);

  // If the currently selected color isn't available for the new size, clear it
  useEffect(() => {
    if (color && !colorsForSize.includes(color)) setColor(null);
  }, [size, colorsForSize, color]);

  // Notify parent when selection produces a complete match
  useEffect(() => {
    if ((sizes.length === 0 || size) && (allColors.length === 0 || color)) {
      const v = findVariant(variants, size || undefined, color || undefined);
      onChange?.(v);
    } else {
      onChange?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, color]);

  /**
   * For a given size, is there ANY in-stock variant?
   * Used to gray out unselectable sizes.
   */
  const isSizeAvailable = (s: string) =>
    variants.some(v => v.size === s && (v.stock ?? 0) > 0);

  /**
   * Is the given color in stock for the currently selected size?
   * (If no size selected, checks across all sizes.)
   */
  const isColorAvailable = (c: string) =>
    variants.some(v =>
      (size ? v.size === size : true) &&
      v.color === c &&
      (v.stock ?? 0) > 0
    );

  if (variants.length === 0) return null;

  return (
    <div className="variant-picker">
      {sizes.length > 0 && (
        <div className="variant-picker-section">
          <div className="variant-picker-label">
            Size {size && <span className="variant-picker-selected">— {size}</span>}
          </div>
          <div className="variant-picker-chips">
            {sizes.map(s => {
              const exists = variants.some(v => v.size === s);
              const inStock = isSizeAvailable(s);
              return (
                <button
                  key={s}
                  type="button"
                  className={`variant-chip ${size === s ? 'selected' : ''} ${!exists ? 'missing' : ''} ${!inStock ? 'sold-out' : ''}`}
                  onClick={() => exists && inStock && setSize(s)}
                  disabled={!exists || !inStock}
                  title={!inStock ? 'Sold out' : ''}
                >
                  {s}
                  {!inStock && <span className="variant-chip-strike" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colorsForSize.length > 0 && (
        <div className="variant-picker-section">
          <div className="variant-picker-label">
            Color {color && <span className="variant-picker-selected">— {color}</span>}
          </div>
          <div className="variant-picker-chips">
            {colorsForSize.map(c => {
              const inStock = isColorAvailable(c);
              return (
                <button
                  key={c}
                  type="button"
                  className={`variant-chip ${color === c ? 'selected' : ''} ${!inStock ? 'sold-out' : ''}`}
                  onClick={() => inStock && setColor(c)}
                  disabled={!inStock}
                  title={!inStock ? 'Sold out in this size' : ''}
                >
                  {c}
                  {!inStock && <span className="variant-chip-strike" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock + price feedback for the picked combo */}
      {((sizes.length === 0 || size) && (allColors.length === 0 || color)) && (() => {
        const v = findVariant(variants, size || undefined, color || undefined);
        if (!v) {
          return <p className="variant-picker-feedback unavailable">This combination is not available.</p>;
        }
        const band = stockBand(v.stock);
        const priceInfo = computePriceInfo(v.price, v.mrp);
        return (
          <div className="variant-picker-feedback">
            <div className="variant-picker-price-row">
              <span className="variant-picker-price">₹{v.price}</span>
              {priceInfo.hasDiscount && (
                <>
                  <span className="variant-picker-mrp">₹{priceInfo.mrp}</span>
                  <span className="variant-picker-discount">{priceInfo.discountPercent}% OFF</span>
                </>
              )}
            </div>
            <span className={`variant-picker-stock band-${band}`}>{stockLabel(v.stock)}</span>
          </div>
        );
      })()}
    </div>
  );
};

export default VariantPicker;
