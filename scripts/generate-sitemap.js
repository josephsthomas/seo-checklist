/**
 * Sitemap.xml Generator
 * Generates a sitemap.xml at build time for all public routes
 * Run: node scripts/generate-sitemap.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Base URL - configurable via environment variable
const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://contentstrategyportal.com';

// Public routes that should appear in the sitemap
const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/features', changefreq: 'monthly', priority: '0.8' },
  { path: '/features/planner', changefreq: 'monthly', priority: '0.7' },
  { path: '/features/audit', changefreq: 'monthly', priority: '0.7' },
  { path: '/features/accessibility', changefreq: 'monthly', priority: '0.7' },
  { path: '/features/meta-generator', changefreq: 'monthly', priority: '0.7' },
  { path: '/features/schema-generator', changefreq: 'monthly', priority: '0.7' },
  { path: '/features/image-alt', changefreq: 'monthly', priority: '0.7' },
  { path: '/features/readability', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/login', changefreq: 'yearly', priority: '0.3' },
  { path: '/register', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/ai-policy', changefreq: 'yearly', priority: '0.2' },
  { path: '/accessibility-statement', changefreq: 'yearly', priority: '0.2' }
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const urls = routes.map(route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const publicDir = resolve(__dirname, '..', 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf-8');
  console.log(`Sitemap generated with ${routes.length} URLs at public/sitemap.xml`);
}

generateSitemap();
