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
  let slug = text.toLowerCase().trim();

  // Нормализуем все типы дефисов к обычному "-" ДО обработки диапазонов
  slug = slug.replace(/[–—―−]/g, "-");

  // Удаляем скобки и их содержимое (типа "(1816–1828)")
  slug = slug.replace(/\s*\([^)]*\)/g, "");

  // Исправление: слипшиеся диапазоны лет уже после замены дефисов
  // Паттерн: 4 цифры сразу после 4 цифр -> разделяем дефисом
  slug = slug.replace(/(\d{4})(\d{4})/g, "$1-$2");

  // Удаляем "ongoing"/"present"/"current" в конце
  slug = slug.replace(/-?(?:ongoing|present|current)$/g, "");

  // Превращаем "400 bc"/"400bc" → "400-bc", "800 ad" → "800-ad"
  slug = slug.replace(/\b(\d{1,4})\s*(bc|ad)\b/g, "$1-$2");

  // Удаляем повторы годов типа "...-1812-1812"
  slug = slug.replace(/(-\d{1,4})-\1\b/g, "$1");

  // Пробелы/подчёркивания → дефисы
  slug = slug.replace(/[\s_]+/g, "-");

  // Оставляем только латиницу, цифры и дефисы
  slug = slug.replace(/[^a-z0-9-]/g, "");

  // Сжимаем повторные дефисы
  slug = slug.replace(/-+/g, "-");

  // Убираем дефисы по краям
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
};

const generateSlug = (title, year) => {
  const titleSlug = slugify(title);
  const y = (year ?? "").trim();
  if (!y) return titleSlug;

  // Нормализуем год для slug (удаляем минус для BC лет)
  const yearSlug = y.toLowerCase().replace(/^-/, "");
  
  // если уже заканчивается на "-год" (в т.ч. "-405-bc", "-1980"), ничего не добавляем
  const endsWithYear = new RegExp(`-${yearSlug.replace(/-/g, '\\-')}$`);
  return endsWithYear.test(titleSlug) ? titleSlug : `${titleSlug}-${yearSlug}`;
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
    // 🧹 Убираем года из title, чтобы не было дублей
    const cleanTitle = event.title.replace(/\(?\b\d{3,4}(?:[–—-]\d{2,4})?\)?/g, '').trim();

    // 🧮 Нормализуем и убираем повтор года
    let year = String(event.year || '')
      .replace(/[–—]/g, '-') // заменяем длинные тире на обычные
      .replace(/^(\d{3,4})-\1$/, '$1') // если повтор, оставляем один (1812-1812 → 1812)
      .replace(/^(\d{3,4})-\1-(\d{3,4})$/, '$1-$3') // если 1812-1812-1815 → 1812-1815
      .trim();

    // 🧩 Финальный slug без дублей годов
    const slug = slugify(`${cleanTitle} ${year}`.trim());
  sitemap += `  <!-- ${event.title} -->
  <url>
    <loc>https://evid.world/event/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

`;
});

// Add category pages - use URL-friendly slugs
const categories = [
  { type: 'war', slug: 'war' },
  { type: 'earthquake', slug: 'earthquake' },
  { type: 'terror', slug: 'terror' },
  { type: 'archaeology', slug: 'archaeology' },
  { type: 'fire', slug: 'wildfire' },
  { type: 'disaster', slug: 'disaster' },
  { type: 'tsunami', slug: 'tsunami' },
  { type: 'meteorite', slug: 'meteorite' },
  { type: 'epidemic', slug: 'epidemic' },
  { type: 'man-made disaster', slug: 'man-made-disaster' }
];

categories.forEach(({ type, slug }) => {
  sitemap += `  <!-- Category: ${type} -->
  <url>
    <loc>https://evid.world/category/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
});

sitemap += `</urlset>`;

// Write sitemap to public folder
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
// 🧹 Удаляем старый sitemap, если он существует
if (fs.existsSync(sitemapPath)) {
  fs.unlinkSync(sitemapPath);
  console.log('🗑️ Старый sitemap.xml удалён перед генерацией.');
}
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

console.log(`✅ Sitemap generated with ${events.length} event pages!`);
console.log(`📄 File: ${sitemapPath}`);
