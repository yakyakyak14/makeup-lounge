export const baseKeywords = [
  'makeup', 'make-up', 'makeup artist', 'professional makeup', 'beauty services',
  'bridal makeup', 'wedding makeup', 'event makeup', 'glam makeup', 'photoshoot makeup',
  'cosmetics', 'beauty salon', 'beauty booking', 'makeup appointment',
  'nigerian makeup', 'african beauty', 'dark skin makeup', 'light skin makeup',
  'hausa fulani makeup', 'yoruba bridal', 'igbo bridal',
];

const routeKeywordMap: Record<string, string[]> = {
  '/': ['book makeup artist', 'best makeup near me', 'beauty platform', 'online makeup booking'],
  '/bookings': ['manage bookings', 'makeup appointment management', 'client bookings', 'artist bookings'],
  '/messages': ['chat with makeup artist', 'negotiate price', 'discuss beauty looks'],
  '/browse': ['discover makeup artists', 'find beauty services', 'nearby makeup artists'],
  '/services': ['makeup packages', 'beauty service list', 'pricing'],
  '/profile': ['makeup portfolio', 'artist profile', 'beauty reviews'],
  '/ratings': ['makeup artist ratings', 'client reviews', 'testimonials'],
  '/dashboard': ['artist dashboard', 'client dashboard', 'booking overview'],
  '/settings': ['account settings', 'notifications', 'preferences'],
  '/help': ['support', 'faqs', 'contact support'],
};

export function getKeywords(pathname: string, extra: string[] = []): string {
  const normalized = pathname?.replace(/\/$/, '') || '/';
  const routeWords = routeKeywordMap[normalized] || [];
  const envExtra = (import.meta as any)?.env?.VITE_SEO_EXTRA_KEYWORDS as string | undefined;
  const envList = envExtra ? envExtra.split(',').map(s => s.trim()).filter(Boolean) : [];
  const unique = Array.from(new Set([...baseKeywords, ...routeWords, ...envList, ...extra]));
  return unique.join(', ');
}
