import { useEffect } from 'react';

/**
 * Per-page <title>, description, canonical and robots tags.
 *
 * Why this exists: the app is a single-page app served from one index.html, so
 * every URL used to carry the same title and a canonical pointing at the
 * homepage. That told Google every page was a duplicate of "/".
 *
 * Rules this hook follows (from Google's JavaScript SEO guidance):
 *  - index.html declares NO canonical. This hook injects exactly one, so the
 *    rendered page never carries two conflicting canonical tags.
 *  - Canonicals always use the real public domain, so the same page reached
 *    through the raw CloudFront hostname consolidates onto www.unseenprice.com.
 *  - When a page unmounts, tags revert to the index.html defaults, so a page
 *    that never calls this hook cannot inherit the previous page's tags.
 */

export const SITE_URL = 'https://www.unseenprice.com';
export const SITE_NAME = 'Unseen Price';

export interface PageMeta {
  /** Page-specific title. " | Unseen Price" is appended. Omit for the site default. */
  title?: string;
  /** Plain text. Whitespace is collapsed and long text trimmed to ~160 chars. */
  description?: string;
  /** Canonical path such as "/pricing". Omit to emit no canonical. */
  path?: string;
  /** Absolute URL or site-relative path of a preview image. */
  image?: string;
  /** Keep this page out of search results (private or utility pages). */
  noindex?: boolean;
}

// Snapshot index.html's defaults once, before any page modifies the head.
const defaults = {
  title: document.title,
  description: getMeta('name', 'description'),
  ogTitle: getMeta('property', 'og:title'),
  ogDescription: getMeta('property', 'og:description'),
  ogUrl: getMeta('property', 'og:url'),
  ogImage: getMeta('property', 'og:image'),
  twitterTitle: getMeta('property', 'twitter:title'),
  twitterDescription: getMeta('property', 'twitter:description'),
  twitterUrl: getMeta('property', 'twitter:url'),
  twitterImage: getMeta('property', 'twitter:image'),
  robots: getMeta('name', 'robots') || 'index, follow',
};

function getMeta(attr: 'name' | 'property', key: string): string {
  return document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)?.content ?? '';
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Collapse whitespace and trim to a search-snippet-friendly length. */
export function toMetaDescription(text: string | undefined | null, max = 160): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

function restoreDefaults() {
  document.title = defaults.title;
  setMeta('name', 'description', defaults.description);
  setMeta('property', 'og:title', defaults.ogTitle);
  setMeta('property', 'og:description', defaults.ogDescription);
  setMeta('property', 'og:url', defaults.ogUrl);
  setMeta('property', 'og:image', defaults.ogImage);
  setMeta('property', 'twitter:title', defaults.twitterTitle);
  setMeta('property', 'twitter:description', defaults.twitterDescription);
  setMeta('property', 'twitter:url', defaults.twitterUrl);
  setMeta('property', 'twitter:image', defaults.twitterImage);
  setMeta('name', 'robots', defaults.robots);
  setCanonical(null);
}

export function usePageMeta({ title, description, path, image, noindex }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : defaults.title;
    const desc = description ? toMetaDescription(description) : defaults.description;
    const url = path !== undefined ? absoluteUrl(path) : null;
    const img = image ? absoluteUrl(image) : defaults.ogImage;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : defaults.robots);

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', img);
    setMeta('property', 'twitter:title', fullTitle);
    setMeta('property', 'twitter:description', desc);
    setMeta('property', 'twitter:image', img);

    // Private pages get no canonical: they should not be indexed at all.
    const canonical = noindex ? null : url;
    setCanonical(canonical);
    setMeta('property', 'og:url', canonical ?? defaults.ogUrl);
    setMeta('property', 'twitter:url', canonical ?? defaults.twitterUrl);

    return restoreDefaults;
  }, [title, description, path, image, noindex]);
}

export default usePageMeta;
