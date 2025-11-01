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

/**
 * Extract year from title if it's in parentheses at the end
 */
const extractYearFromTitle = (title) => {
  const yearInParenthesesPattern = /^(.+?)\s*\(([^)]+)\)\s*$/;
  const match = title.match(yearInParenthesesPattern);
  
  if (!match) {
    return { cleanTitle: title, extractedYear: null };
  }
  
  const cleanTitle = match[1].trim();
  let yearPart = match[2].trim();
  
  // Handle "7th century" format
  if (yearPart.toLowerCase().includes('century')) {
    return { 
      cleanTitle, 
      extractedYear: yearPart.toLowerCase().replace(/\s+/g, '-')
    };
  }
  
  // Handle BC dates
  if (yearPart.toLowerCase().includes('bc')) {
    yearPart = yearPart.toLowerCase().replace(/\s*bc\s*/gi, '').trim() + '-bc';
  }
  
  // Handle year ranges with various dash types
  yearPart = yearPart.replace(/[–—]/g, '-');
  yearPart = yearPart.replace(/\s*-\s*/g, '-');
  
  return { cleanTitle, extractedYear: yearPart };
};

const generateSlug = (title, year) => {
  let cleanTitle = title;
  let finalYear = year;
  
  // If no year provided, try to extract from title
  if (!finalYear) {
    const extracted = extractYearFromTitle(title);
    cleanTitle = extracted.cleanTitle;
    finalYear = extracted.extractedYear || undefined;
  }
  
  // If still no year, just return slugified title
  if (!finalYear) {
    return slugify(cleanTitle);
  }
  
  // Remove -ongoing suffix if present
  finalYear = finalYear.replace(/-ongoing$/i, '').trim();
  
  // Check if title starts with year pattern
  const yearAtStartPattern = /^(\d{1,4}(?:-\d{1,4})?(?:\s*bc)?)\s+(.+)$/i;
  const yearMatch = cleanTitle.match(yearAtStartPattern);
  
  if (yearMatch) {
    cleanTitle = yearMatch[2];
  }
  
  // Process BC years: ensure only one -bc suffix
  if (finalYear.toLowerCase().includes('bc')) {
    finalYear = finalYear.replace(/\s*bc/gi, '').trim();
    finalYear = `${finalYear}-bc`;
  }
  
  // Replace various dash types with regular hyphen
  finalYear = finalYear.replace(/[–—]/g, '-');
  
  // Clean up the year string
  finalYear = finalYear.replace(/\s+/g, '-').replace(/--+/g, '-');
  
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