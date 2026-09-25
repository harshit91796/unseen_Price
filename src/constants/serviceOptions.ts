/**
 * The fixed lists behind a service listing.
 *
 * serviceType is what customers filter by, so it has to be a shared vocabulary:
 * a stray "Haircut " with a trailing space would quietly split one category into
 * two. The product side of this app never enforced that and now holds Hoodie,
 * hoodie, Hoodies and "Hoodie " as four separate buckets.
 *
 * The live list now comes from the database via useServiceTypes(), so an admin
 * can add a type without a developer or a deploy, and an owner whose trade is
 * missing can suggest one through "Other". The array below is only a fallback for
 * when that request fails, so the form still renders something usable offline.
 */

/** Fallback only — the real list comes from GET /service/types. */
export const FALLBACK_SERVICE_TYPES = [
  'restaurant', 'cafe', 'catering', 'food-delivery',
  'salon', 'spa', 'parlour', 'massage',
  'clinic', 'dental', 'physiotherapy', 'pharmacy',
  'hotel', 'guest-house', 'resort',
  'gym', 'yoga', 'fitness',
  'tutoring', 'coaching',
  'photography', 'event-planning',
  'plumber', 'electrician', 'carpenter', 'mechanic',
  'laundry', 'cleaning'
];

/**
 * The value the dropdowns use for "my trade is not listed". Never stored on a
 * listing: picking it reveals a text box, and what the owner types becomes the
 * service type itself, pending an admin's approval.
 */
export const OTHER_SERVICE_TYPE = '__other__';

/** How the price should be read, e.g. ₹500 per hour rather than ₹500 flat. */
export const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_night', label: 'Per Night' },
  { value: 'per_session', label: 'Per Session' },
  { value: 'per_person', label: 'Per Person' }
];

/** Turn "food-delivery" into "Food Delivery" for display. */
export const prettyServiceType = (value?: string) => (value || '')
  .replace(/-/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase());
