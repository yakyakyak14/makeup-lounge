import { useEffect } from 'react';
import { getSiteUrl, defaultSEO } from './config';

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return;
  const selector = `meta[${attr}="${name}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  const selector = `link[rel="${rel}"]`;
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id: string, data: unknown) {
  const scriptId = id || 'ld-json-business';
  let el = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = scriptId;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string; // path or absolute
  canonicalPath?: string; // optional pathname like '/browse'
};

export const SEO = ({ title, description, keywords, image, canonicalPath }: SEOProps) => {
  useEffect(() => {
    const siteUrl = getSiteUrl();
    const t = title || defaultSEO.title;
    const d = description || defaultSEO.description;
    const img = (image || defaultSEO.image) as string;
    const imageUrl = img.startsWith('http') ? img : `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`;

    // Title
    if (t) document.title = t;

    // Standard meta
    upsertMeta('description', d);
    if (keywords) upsertMeta('keywords', keywords);

    // Open Graph
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:title', t, 'property');
    upsertMeta('og:description', d, 'property');
    upsertMeta('og:image', imageUrl, 'property');

    // Twitter
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', t);
    upsertMeta('twitter:description', d);
    upsertMeta('twitter:image', imageUrl);

    // Canonical
    const canonical = canonicalPath ? `${siteUrl}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}` : siteUrl;
    upsertLink('canonical', canonical);

    // JSON-LD: BeautySalon
    try {
      const name = (import.meta as any)?.env?.VITE_BUSINESS_NAME || 'Make-Up Lounge';
      const telephone = (import.meta as any)?.env?.VITE_BUSINESS_PHONE || '';
      const streetAddress = (import.meta as any)?.env?.VITE_BUSINESS_STREET || '';
      const addressLocality = (import.meta as any)?.env?.VITE_BUSINESS_CITY || '';
      const addressRegion = (import.meta as any)?.env?.VITE_BUSINESS_REGION || '';
      const postalCode = (import.meta as any)?.env?.VITE_BUSINESS_POSTAL || '';
      const addressCountry = (import.meta as any)?.env?.VITE_BUSINESS_COUNTRY || '';
      const latitude = (import.meta as any)?.env?.VITE_BUSINESS_LAT || '';
      const longitude = (import.meta as any)?.env?.VITE_BUSINESS_LNG || '';
      const sameAsRaw = (import.meta as any)?.env?.VITE_BUSINESS_SAMEAS || '';
      const sameAs = sameAsRaw
        ? String(sameAsRaw)
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

      const jsonLd: any = {
        '@context': 'https://schema.org',
        '@type': 'BeautySalon',
        name,
        image: imageUrl,
        description: d,
        url: siteUrl,
      };

      const address: any = {
        '@type': 'PostalAddress',
      };
      if (streetAddress) address.streetAddress = streetAddress;
      if (addressLocality) address.addressLocality = addressLocality;
      if (addressRegion) address.addressRegion = addressRegion;
      if (postalCode) address.postalCode = postalCode;
      if (addressCountry) address.addressCountry = addressCountry;
      if (Object.keys(address).length > 1) jsonLd.address = address;

      if (telephone) jsonLd.telephone = telephone;
      if (latitude && longitude) {
        jsonLd.geo = {
          '@type': 'GeoCoordinates',
          latitude,
          longitude,
        };
      }
      if (sameAs.length) jsonLd.sameAs = sameAs;

      upsertJsonLd('ld-json-business', jsonLd);
    } catch (e) {
      // no-op if JSON-LD fails
    }
  }, [title, description, keywords, image, canonicalPath]);

  return null;
};
