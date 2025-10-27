import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events data
const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

// Generate slugs for each event
const generateSlug = (title, year) => {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
  return year ? `${titleSlug}-${year}` : titleSlug;
};

// Get current date
const today = new Date().toISOString().split('T')[0];

// Start building sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>https://evid.world/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

`;

// Add event pages
events.forEach(event => {
  const slug = generateSlug(event.title, event.year);
  sitemap += `  <!-- ${event.title} -->
  <url>
    <loc>https://evid.world/event/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

`;
});

// Add category pages
const categories = ['war', 'earthquake', 'terror', 'archaeology', 'fire', 'disaster', 'tsunami', 'meteorite', 'epidemic', 'man-made-disaster'];
categories.forEach(category => {
  sitemap += `  <!-- Category: ${category} -->
  <url>
    <loc>https://evid.world/category/${category}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
});

sitemap += `</urlset>`;

// Write sitemap to public folder
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

console.log(`✅ Sitemap generated with ${events.length} event pages!`);
console.log(`📄 File: ${sitemapPath}`);
