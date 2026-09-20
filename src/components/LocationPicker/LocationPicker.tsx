import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { fetchPlaceSuggestions, reverseGeocode } from '../../utils/opencage';
import './LocationPicker.css';

/**
 * Pick a shop's location: search for an address, then confirm or drag the pin.
 *
 * Why the map matters: the old form only had a search box. If an owner typed an
 * address but never clicked a suggestion, the shop was saved at coordinates 0,0
 * and never appeared in any nearby search. The owner had no way to notice.
 *
 * Map tiles come from OpenStreetMap, the same source as the address search. No
 * API key, no billing account.
 */

export interface PickedLocation {
  /** [longitude, latitude] — the order the backend stores. */
  coordinates: [number, number] | null;
  address: { street: string; city: string; state: string; zipCode: string; country: string };
}

interface Props {
  value: PickedLocation;
  onChange: (next: PickedLocation) => void;
  /** Shown under the field, e.g. a validation error. */
  error?: string;
}

// Vite bundles these as assets, so Leaflet's default icon paths must be replaced.
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const INDIA_CENTER: [number, number] = [22.9734, 78.6569];   // [lat, lng] for Leaflet
const hasPin = (c: [number, number] | null): c is [number, number] =>
  Array.isArray(c) && c.length === 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]) && !(c[0] === 0 && c[1] === 0);

const LocationPicker: React.FC<Props> = ({ value, onChange, error }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read inside map callbacks without re-creating the map on every change.
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  /** Dragging the pin is the fine adjustment: keep it, then refresh the address. */
  const applyPin = async (lat: number, lng: number) => {
    onChangeRef.current({ ...valueRef.current, coordinates: [lng, lat] });
    try {
      // reverseGeocode returns a flat { city, state, country } — no street or postcode.
      const place = await reverseGeocode(lat, lng);
      if (place) {
        const current = valueRef.current.address;
        onChangeRef.current({
          coordinates: [lng, lat],
          address: {
            street: current.street || '',
            city: place.city || current.city || '',
            state: place.state || current.state || '',
            zipCode: current.zipCode || '',
            country: place.country || current.country || ''
          }
        });
      }
    } catch {
      // Keeping the pin is more important than refreshing the address text.
    }
  };

  // Create the map once.
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    const start = hasPin(value.coordinates)
      ? ([value.coordinates[1], value.coordinates[0]] as [number, number])
      : INDIA_CENTER;

    const map = L.map(mapEl.current, { attributionControl: true }).setView(start, hasPin(value.coordinates) ? 16 : 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Clicking the map is another way to place the pin.
    map.on('click', (e: L.LeafletMouseEvent) => applyPin(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;

    // The container is often hidden when the modal opens; Leaflet needs a nudge.
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the pin in step with the value.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasPin(value.coordinates)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const [lng, lat] = value.coordinates;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(map);
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        applyPin(p.lat, p.lng);
      });
      markerRef.current = marker;
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 16));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.coordinates?.[0], value.coordinates?.[1]]);

  const runSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    // OpenStreetMap asks for at most one search per second.
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        setSuggestions(await fetchPlaceSuggestions(text));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 800);
  };

  const pickSuggestion = (s: any) => {
    const f = s.formatted || {};
    onChange({
      coordinates: [s.coordinates.lng, s.coordinates.lat],
      address: {
        street: f.street || '',
        city: f.city || '',
        state: f.state || '',
        // Suggestions carry no postcode; keep whatever the owner typed.
        zipCode: value.address.zipCode || '',
        country: f.country || ''
      }
    });
    setSuggestions([]);
    setQuery('');
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyPin(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const summary = [value.address.street, value.address.city, value.address.state, value.address.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="location-picker">
      <div className="location-picker-search">
        <input
          type="text"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="Search your shop's address, area or landmark"
          className="location-picker-input"
        />
        <button type="button" className="location-picker-gps" onClick={useMyLocation} disabled={locating}>
          {locating ? 'Locating…' : 'Use my location'}
        </button>

        {searching && <p className="location-picker-hint">Searching…</p>}
        {suggestions.length > 0 && (
          <ul className="location-picker-suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => pickSuggestion(s)}>
                {[s.formatted?.street, s.formatted?.city, s.formatted?.state, s.formatted?.country].filter(Boolean).join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div ref={mapEl} className="location-picker-map" />

      {hasPin(value.coordinates) ? (
        <p className="location-picker-status ok">
          Pin placed{summary ? `: ${summary}` : ''}. Drag it to correct the exact spot.
        </p>
      ) : (
        <p className="location-picker-status warn">
          No location set yet. Search above, or tap the map. Without a pin your shop will not appear in nearby searches.
        </p>
      )}

      {error && <p className="location-picker-error" role="alert">{error}</p>}
    </div>
  );
};

export default LocationPicker;
