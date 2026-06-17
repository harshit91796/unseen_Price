/**
 * Ad frequency cap — prevents the same user from seeing the same ad too many
 * times per day. Stored entirely in localStorage; no backend tracking needed.
 *
 * Approach:
 *  - Each ad has a daily impression budget (default 5)
 *  - Once an ad hits its cap, it's filtered out of subsequent selections for the day
 *  - Counters reset automatically when the date changes (new day, fresh budget)
 *
 * Usage:
 *   const visible = filterByFrequencyCap(allAds);   // pre-display filter
 *   recordImpressions(visible.slice(0, 5));         // after picking what to show
 */

const STORAGE_KEY = 'adFrequency';
const DEFAULT_DAILY_CAP = 5;

interface AdFrequencyData {
  date: string;                  // YYYY-MM-DD
  counts: Record<string, number>; // adId -> impressions seen today
}

/** Today's date string in local time (YYYY-MM-DD). */
const todayKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const readStore = (): AdFrequencyData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayKey(), counts: {} };
    const parsed = JSON.parse(raw) as AdFrequencyData;
    // Daily reset
    if (parsed.date !== todayKey()) {
      return { date: todayKey(), counts: {} };
    }
    return parsed;
  } catch {
    return { date: todayKey(), counts: {} };
  }
};

const writeStore = (data: AdFrequencyData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — fail silently
  }
};

/**
 * Filter out ads that have already hit the daily cap for this user.
 * Returns the filtered list (preserves order).
 */
export const filterByFrequencyCap = <T extends { _id: string }>(
  ads: T[],
  cap: number = DEFAULT_DAILY_CAP
): T[] => {
  if (!Array.isArray(ads) || ads.length === 0) return ads;
  const store = readStore();
  return ads.filter(ad => (store.counts[ad._id] || 0) < cap);
};

/**
 * Record one impression for each ad in the list. Called when ads are actually
 * displayed to the user. Updates localStorage in a single write.
 */
export const recordImpressions = <T extends { _id: string }>(ads: T[]): void => {
  if (!Array.isArray(ads) || ads.length === 0) return;
  const store = readStore();
  for (const ad of ads) {
    if (!ad?._id) continue;
    store.counts[ad._id] = (store.counts[ad._id] || 0) + 1;
  }
  writeStore(store);
};

/**
 * Get current impression count for a specific ad (for debugging or UI).
 */
export const getImpressionCount = (adId: string): number => {
  return readStore().counts[adId] || 0;
};

/**
 * Clear all impression counts for the day (debugging / "see them again" flow).
 */
export const clearFrequencyData = (): void => {
  writeStore({ date: todayKey(), counts: {} });
};

/**
 * Mark an ad as dismissed by the user — fills its impression count up to
 * the cap so the filter automatically excludes it for the rest of the day.
 */
export const dismissAd = (adId: string, cap: number = DEFAULT_DAILY_CAP): void => {
  if (!adId) return;
  const store = readStore();
  store.counts[adId] = Math.max(store.counts[adId] || 0, cap);
  writeStore(store);
};
