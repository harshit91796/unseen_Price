import { useEffect, useState } from 'react';
import { getServiceTypes } from '../Api';
import { FALLBACK_SERVICE_TYPES, prettyServiceType } from '../constants/serviceOptions';

/**
 * The service types every dropdown shows.
 *
 * One source for all three screens that need it — the Add Service form, the Edit
 * Service modal and the customer search filter. They previously kept their own
 * hardcoded copies, and two of them had already drifted apart: 28 types in the
 * forms against 17 in the filter, so an owner could list a mechanic that no
 * customer could ever filter for.
 *
 * The result is cached at module level, so opening all three screens in one visit
 * makes one request rather than three. If the request fails the shipped list is
 * used instead, because a form that cannot be submitted is worse than a form
 * offering a slightly stale list.
 */

export interface ServiceTypeOption {
  name: string;
  label: string;
}

const asFallback = (): ServiceTypeOption[] =>
  FALLBACK_SERVICE_TYPES.map((name) => ({ name, label: prettyServiceType(name) }));

let cache: ServiceTypeOption[] | null = null;
let inFlight: Promise<ServiceTypeOption[]> | null = null;

const load = (): Promise<ServiceTypeOption[]> => {
  if (cache) return Promise.resolve(cache);
  if (inFlight) return inFlight;

  inFlight = getServiceTypes()
    .then((rows: any) => {
      const list: ServiceTypeOption[] = Array.isArray(rows)
        ? rows
            .filter((row: any) => row && row.name)
            .map((row: any) => ({ name: String(row.name), label: row.label || prettyServiceType(row.name) }))
        : [];
      // An empty list means an unseeded database; the shipped list is better than
      // a dropdown with nothing in it.
      cache = list.length > 0 ? list : asFallback();
      return cache;
    })
    .catch(() => asFallback())
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/** Drop the cache so the next screen refetches — used after an admin edits the list. */
export const invalidateServiceTypes = () => {
  cache = null;
};

const useServiceTypes = () => {
  const [types, setTypes] = useState<ServiceTypeOption[]>(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    load().then((list) => {
      if (!active) return;
      setTypes(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { types, loading };
};

export default useServiceTypes;
