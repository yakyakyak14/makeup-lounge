import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Dynamic base path: derives from SITE_URL (path portion) or BASE_PATH
  // Examples:
  // - GitHub Pages: SITE_URL=https://<user>.github.io/makeup-lounge -> base /makeup-lounge/
  // - Custom domain: SITE_URL=https://example.com -> base /
  // - Explicit: BASE_PATH=/custom/
  base: (() => {
    const siteUrl = process.env.SITE_URL;
    if (siteUrl) {
      try {
        const u = new URL(siteUrl);
        const p = u.pathname || "/";
        const normalized = p.endsWith("/") ? p : `${p}/`;
        return normalized === "/" ? "/" : normalized;
      } catch {}
    }
    const explicit = process.env.BASE_PATH || process.env.VITE_BASE_PATH;
    if (explicit) {
      const trimmed = explicit.trim();
      if (trimmed) {
        const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
        return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
      }
    }
    // Fallback to GitHub Pages default when in production
    return mode === "production" ? "/makeup-lounge/" : "/";
  })(),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
