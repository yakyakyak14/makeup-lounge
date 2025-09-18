export const getSiteUrl = (): string => {
  // Prefer explicit env variable (use for custom domain)
  const envUrl = (import.meta as any)?.env?.VITE_SITE_URL as string | undefined;
  if (envUrl && /^https?:\/\//.test(envUrl)) return envUrl.replace(/\/$/, '');

  // Include vite base path when computing origin for GitHub Pages
  const base = (import.meta as any)?.env?.BASE_URL as string | undefined;

  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, '');
    const basePath = (base || '/').replace(/\/$/, '');
    // If base is '/', just return origin; otherwise append base path
    return basePath === '' || basePath === '/' ? origin : `${origin}${basePath}`;
  }

  // Default to GitHub Pages base as final fallback
  return 'https://yakyakyak14.github.io/makeup-lounge';
};

export const defaultSEO = {
  title: 'Make-Up Lounge | Professional Beauty & Makeup Services',
  description:
    'Book professional makeup artists for weddings, events, and photoshoots. Expert beauty services, bridal makeup, glam looks, and more. Secure online booking 24/7.',
  image: '/logo.png',
};
