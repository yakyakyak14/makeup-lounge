// Build-time generator for sitemap.xml and robots.txt
// Works for GitHub Pages and custom domains via SITE_URL env

const fs = require('fs');
const path = require('path');

// Lightweight .env loader (no external deps)
(() => {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const txt = fs.readFileSync(envPath, 'utf8');
      txt.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) return;
        const key = m[1];
        let val = m[2];
        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      });
    }
  } catch (e) {
    // ignore
  }
})();

function getEnv(name, def) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : def;
}

const defaultSiteUrl = 'https://yakyakyak14.github.io/makeup-lounge';
const SITE_URL = getEnv('SITE_URL', defaultSiteUrl).replace(/\/$/, '');

// Known static routes from src/App.tsx
const baseRoutes = [
  '/',
  '/auth',
  '/auth/callback',
  '/dashboard',
  '/settings',
  '/bookings',
  '/profile',
  '/ratings',
  '/services',
  '/browse',
  '/messages',
  '/notifications',
  '/help',
];

// Allow extra routes via env, comma-separated
const extraRoutes = getEnv('SEO_EXTRA_ROUTES', '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const routes = Array.from(new Set([...baseRoutes, ...extraRoutes]));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(target, content) {
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content);
  console.log(`Wrote ${target} (${content.length} bytes)`);
}

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function generateSitemap() {
  const today = isoDate();
  const urls = routes
    .map((r) => {
      const loc = `${SITE_URL}${r.startsWith('/') ? '' : '/'}${r}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${r === '/' ? '1.0' : '0.8'}</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function generateRobots() {
  return `# robots.txt generated at build\nUser-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

function main() {
  const publicDir = path.resolve(__dirname, '..', 'public');
  writeFile(path.join(publicDir, 'sitemap.xml'), generateSitemap());
  writeFile(path.join(publicDir, 'robots.txt'), generateRobots());
}

main();
