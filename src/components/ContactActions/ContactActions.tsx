import React from 'react';
import { Phone, WhatsApp, Directions } from '@mui/icons-material';
import './ContactActions.css';

/**
 * The three things a customer can actually do on this marketplace: call the shop,
 * message it, or walk to it.
 *
 * Product and service pages used to end in "Add to Cart", "Buy Now", "Book Now"
 * and "Inquire". None of them worked — Buy Now was an empty function, and Add to
 * Cart popped "Added to cart successfully" for something that was never stored
 * anywhere. There is no cart, no checkout and no Order model in the backend,
 * because the product is discovery: people find a shop and contact or visit it.
 *
 * One component so the product page, the service page and the shop page cannot
 * drift apart the way the service-type dropdowns did.
 */

interface ContactActionsProps {
  /** As stored on the shop, in whatever shape the owner typed it. */
  phone?: string;
  /** [longitude, latitude] — the order the backend stores. */
  coordinates?: number[] | null;
  address?: { street?: string; city?: string; state?: string; zipCode?: string } | null;
  /** What the WhatsApp message should mention, e.g. the product name. */
  subject?: string;
  /** onDark sits on the navy shop card; onLight on a white page. */
  variant?: 'onLight' | 'onDark';
}

/**
 * Turn a typed phone number into what wa.me expects: digits with a country code.
 *
 * Owners here type Indian numbers, usually as 10 digits, sometimes with a leading
 * 0 or a +91. wa.me refuses anything that is not a full international number, so
 * a bare 10-digit number has to be prefixed or the link silently fails.
 */
export const toWhatsAppNumber = (raw?: string): string => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;                       // 9876543210
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;   // 919876543210
  return digits;                                                        // already international
};

/** Coordinates are exact; the address is the fallback when no pin was ever set. */
export const buildMapsUrl = (
  coordinates?: number[] | null,
  address?: ContactActionsProps['address']
): string => {
  const hasPin = Array.isArray(coordinates) && coordinates.length === 2 && (coordinates[0] || coordinates[1]);
  if (hasPin) return `https://www.google.com/maps?q=${coordinates![1]},${coordinates![0]}`;

  const text = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');
  return text ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}` : '';
};

const ContactActions: React.FC<ContactActionsProps> = ({
  phone,
  coordinates,
  address,
  subject,
  variant = 'onLight'
}) => {
  const dialable = String(phone || '').replace(/\s+/g, '');
  const whatsapp = toWhatsAppNumber(phone);
  const mapsUrl = buildMapsUrl(coordinates, address);

  // Nothing to offer: render nothing rather than dead buttons.
  if (!dialable && !mapsUrl) return null;

  const message = subject
    ? `Hi, I saw "${subject}" on Unseen Price and I would like to know more.`
    : 'Hi, I found you on Unseen Price and I would like to know more.';

  return (
    <div className={`contact-actions contact-actions-${variant}`}>
      {dialable && (
        <a href={`tel:${dialable}`} className="contact-action contact-action-primary">
          <Phone fontSize="small" /> Call
        </a>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-action contact-action-whatsapp"
        >
          <WhatsApp fontSize="small" /> WhatsApp
        </a>
      )}
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-action">
          <Directions fontSize="small" /> Directions
        </a>
      )}
    </div>
  );
};

export default ContactActions;
