/**
 * Emoji for shop categories.
 *
 * The homepage tiles have always been emoji, but they were hardcoded in Feed.tsx
 * as a list of 14 that did not match the 13 categories in the database. Two of
 * them — Foods and Education — existed only on the homepage, so no shop could ever
 * be in them and tapping the tile led to a permanently empty search.
 *
 * The tiles now come from the database, where each category carries its own `icon`.
 * This map is the fallback for rows saved before that field existed, so nothing
 * renders blank while an admin fills them in.
 */

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  clothes: '👕',
  clothing: '👕',
  shirts: '👔',
  footwear: '👟',
  footwears: '👟',
  student: '🎓',
  students: '🎓',
  education: '📚',
  bicycles: '🚲',
  beauty: '💄',
  vehicles: '🚗',
  electronics: '📱',
  foods: '🍔',
  food: '🍔',
  'medical & clinic': '🏥',
  medical: '🏥',
  sports: '🏆',
  'toys & games': '🎮',
  toys: '🎮',
  jewelry: '💎',
  jewellery: '💎',
  'other services': '💡'
};

/** A generic storefront, for a category nobody has chosen an emoji for. */
export const GENERIC_CATEGORY_ICON = '🏪';

/**
 * The emoji to show for a category: the one an admin chose, else a sensible guess
 * from the name, else a generic storefront.
 */
export const categoryIcon = (name?: string, icon?: string): string => {
  if (icon && icon.trim()) return icon.trim();
  const key = String(name || '').trim().toLowerCase();
  return DEFAULT_CATEGORY_ICONS[key] || GENERIC_CATEGORY_ICON;
};

/** True when the emoji shown is a fallback rather than something an admin set. */
export const isFallbackIcon = (icon?: string) => !(icon && icon.trim());

export default DEFAULT_CATEGORY_ICONS;
