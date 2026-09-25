/**
 * Numeric form fields that are allowed to be empty.
 *
 * A `number` state cannot hold "nothing typed yet", so price, MRP and stock were
 * initialised to 0 and the box rendered "0". Anything the owner then typed landed
 * next to that zero, and they had to delete it by hand on every single listing.
 *
 * The `|| ''` workaround used on some fields hid the zero but created a different
 * problem: it also blanks a real 0, so "0 in stock" became impossible to type.
 *
 * Keeping '' alongside the number fixes both. The box starts empty, shows a
 * placeholder, and 0 is a value like any other.
 */

export type NumberField = number | '';

/** What the owner typed. An empty box stays empty instead of collapsing to 0. */
export const readNumberField = (raw: string): NumberField => {
  if (String(raw).trim() === '') return '';
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? '' : parsed;
};

/** The number to send to the API. An empty box counts as `fallback`. */
export const toNumber = (value: NumberField | null | undefined, fallback = 0): number => {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Seed a field from a saved value. A missing or zero price means "not set", so the
 * box opens empty; pass keepZero for stock, where 0 is real information.
 */
export const fromSaved = (value: unknown, keepZero = false): NumberField => {
  if (value === null || value === undefined || value === '') return '';
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return '';
  if (parsed === 0 && !keepZero) return '';
  return parsed;
};
