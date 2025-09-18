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
  }, [title, description, keywords, image, canonicalPath]);

  return null;
};
