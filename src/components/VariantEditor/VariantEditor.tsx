import React from 'react';
import { Delete, AddCircleOutline, ContentCopy } from '@mui/icons-material';
import './VariantEditor.css';

export interface Variant {
  size: string;
  color: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
}

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  /** Default values for new rows (e.g. the base price the owner entered). */
  defaults?: Partial<Variant>;
}

const emptyVariant = (): Variant => ({
  size: '',
  color: '',
  price: 0,
  mrp: 0,
  stock: 0,
  sku: ''
});

const VariantEditor: React.FC<VariantEditorProps> = ({ variants, onChange, defaults }) => {
  const addRow = () => {
    onChange([
      ...variants,
      { ...emptyVariant(), price: defaults?.price ?? 0, mrp: defaults?.mrp ?? 0 }
    ]);
  };

  const removeRow = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  const duplicateRow = (idx: number) => {
    const copy = { ...variants[idx] };
    onChange([...variants.slice(0, idx + 1), copy, ...variants.slice(idx + 1)]);
  };

  const update = (idx: number, key: keyof Variant, value: string | number) => {
    const next = variants.map((v, i) => i === idx ? { ...v, [key]: value } : v);
    onChange(next);
  };

  // Detect duplicate (size+color) for visual warning
  const duplicateKeys = new Set<string>();
  const seen = new Set<string>();
  variants.forEach(v => {
    const key = `${v.size.toLowerCase().trim()}|${v.color.toLowerCase().trim()}`;
    if (seen.has(key)) duplicateKeys.add(key);
    seen.add(key);
  });

  return (
    <div className="variant-editor">
      {variants.length === 0 && (
        <p className="variant-editor-hint">
          No variants yet. Add rows for each (Size, Color) combination you sell.
          You can leave Size empty (or Color empty) if your product doesn't have
          that dimension.
        </p>
      )}

      {variants.length > 0 && (
        <div className="variant-table-wrap">
          <table className="variant-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Color</th>
                <th>Price ₹ *</th>
                <th>MRP ₹</th>
                <th>Stock</th>
                <th>SKU</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => {
                const key = `${v.size.toLowerCase().trim()}|${v.color.toLowerCase().trim()}`;
                const isDup = duplicateKeys.has(key);
                return (
                  <tr key={idx} className={isDup ? 'variant-row-dup' : ''}>
                    <td><input type="text" value={v.size} onChange={e => update(idx, 'size', e.target.value)} placeholder="e.g. M" /></td>
                    <td><input type="text" value={v.color} onChange={e => update(idx, 'color', e.target.value)} placeholder="e.g. Red" /></td>
                    <td><input type="number" min={0} value={v.price || ''} onChange={e => update(idx, 'price', Number(e.target.value))} /></td>
                    <td><input type="number" min={0} value={v.mrp || ''} onChange={e => update(idx, 'mrp', Number(e.target.value))} placeholder="optional" /></td>
                    <td><input type="number" min={0} value={v.stock || ''} onChange={e => update(idx, 'stock', Number(e.target.value))} /></td>
                    <td><input type="text" value={v.sku} onChange={e => update(idx, 'sku', e.target.value)} placeholder="optional" /></td>
                    <td className="variant-actions">
                      <button type="button" onClick={() => duplicateRow(idx)} title="Duplicate row"><ContentCopy fontSize="small" /></button>
                      <button type="button" onClick={() => removeRow(idx)} title="Delete row"><Delete fontSize="small" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {duplicateKeys.size > 0 && (
        <p className="variant-warning">⚠ You have duplicate (Size + Color) combinations. Each combination can only be listed once.</p>
      )}

      <button type="button" className="variant-add-btn" onClick={addRow}>
        <AddCircleOutline fontSize="small" /> Add variant
      </button>
    </div>
  );
};

export default VariantEditor;
