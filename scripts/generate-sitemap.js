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

// Generate slugs for each event - matching slugify.ts logic
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

const generateSlug = (title, year) => {
  if (!year) {
    return slugify(title);
  }

  // Remove -ongoing suffix if present
  let processedYear = year.replace(/-ongoing$/i, '').trim();
  
  // Check if title starts with year pattern
  const yearAtStartPattern = /^(\d{1,4}(?:-\d{1,4})?(?:\s*bc)?)\s+(.+)$/i;
  const yearMatch = title.match(yearAtStartPattern);
  
  let cleanTitle = title;
  let finalYear = processedYear;
  
  if (yearMatch) {
    // Move year from start to end
    cleanTitle = yearMatch[2];
    finalYear = processedYear;
  }
  
  // Process BC years: ensure only one -bc suffix
  if (processedYear.toLowerCase().includes('bc')) {
    finalYear = processedYear.replace(/\s*bc/gi, '').trim();
    finalYear = `${finalYear}-bc`;
  }
  
  // Clean up the year string
  finalYear = finalYear.replace(/--+/g, '-');
  
  const titleSlug = slugify(cleanTitle);
  
  // Ensure no duplicate year in slug
  const yearPattern = finalYear.replace(/-/g, '\\-');
  const duplicatePattern = new RegExp(`-${yearPattern}$`);
  
  if (titleSlug.match(duplicatePattern)) {
    return titleSlug;
  }
  
  return `${titleSlug}-${finalYear}`;
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
