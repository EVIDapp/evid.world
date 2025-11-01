import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events data
const eventsPath = path.join(__dirname, '../public/events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

// Remove duplicates by ID
const uniqueEvents = new Map();
events.forEach(event => {
  if (!uniqueEvents.has(event.id)) {
    uniqueEvents.set(event.id, event);
  }
});
events = Array.from(uniqueEvents.values());

// Slugify function matching frontend
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Extract year from title
const extractYear = (title) => {
  const yearMatch = title.match(/\b(\d{4})\b/);
  return yearMatch ? yearMatch[1] : null;
};

// Generate event slug
const generateEventSlug = (title, type, year) => {
  let titleSlug = slugify(title);
  const yearFromTitle = extractYear(title);
  const finalYear = year || yearFromTitle;
  
  if (finalYear && !titleSlug.includes(finalYear)) {
    titleSlug = `${titleSlug}-${finalYear}`;
  }
  
  return `${type}/${titleSlug}`;
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
  
  <!-- Main page -->
  <url>
    <loc>https://evid.world/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Categories list page -->
  <url>
    <loc>https://evid.world/category</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

`;

// Add category pages
const categories = ['war', 'earthquake', 'terror', 'archaeology', 'fire', 'disaster', 'tsunami', 'meteorite', 'epidemic', 'man-made-disaster'];
categories.forEach(category => {
  sitemap += `  <!-- Category: ${category} -->
  <url>
    <loc>https://evid.world/category/${category}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

`;
});

// Add event pages
console.log(`Generating sitemap for ${events.length} events...`);
events.forEach((event, index) => {
  if (index % 100 === 0) {
    console.log(`Processed ${index}/${events.length} events...`);
  }
  const slug = generateEventSlug(event.title, event.type, event.year);
  sitemap += `  <url>
    <loc>https://evid.world/category/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

sitemap += `
</urlset>`;

// Write sitemap to public folder
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

console.log(`\n✅ Sitemap generated successfully!`);
console.log(`📊 Total URLs: ${categories.length + events.length + 2}`);
console.log(`   - Homepage: 1`);
console.log(`   - Category list: 1`);
console.log(`   - Categories: ${categories.length}`);
console.log(`   - Events: ${events.length}`);
console.log(`📄 File: ${sitemapPath}`);
console.log(`\n🔗 Submit to Google Search Console: https://evid.world/sitemap.xml`);
