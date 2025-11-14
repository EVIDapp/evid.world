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

// Извлекает год или диапазон годов из конца строки
const extractYearFromEnd = (text) => {
  const normalized = text.replace(/[–—―−]/g, "-");
  
  // Паттерны для извлечения года из конца:
  const yearPatterns = [
    /\((\d{1,4}(?:-\d{1,4})?(?:-(?:bc|ad))?)\)\s*$/i,  // В скобках в конце
    /,?\s*(\d{1,4}(?:-\d{1,4})?(?:-(?:bc|ad))?)\s*$/i, // Через запятую или просто в конце
  ];
  
  for (const pattern of yearPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const year = match[1].toLowerCase();
      const cleanText = normalized.replace(pattern, '').trim();
      return { text: cleanText, year };
    }
  }
  
  return { text: normalized, year: '' };
};

// Slugify function matching frontend
const slugify = (text) => {
  let slug = text.toLowerCase().trim();

  // Нормализуем все типы дефисов к обычному "-"
  slug = slug.replace(/[–—―−]/g, "-");

  // Удаляем скобки и их содержимое
  slug = slug.replace(/\s*\([^)]*\)/g, "");

  // Удаляем "ongoing"/"present"/"current" в конце
  slug = slug.replace(/-?(?:ongoing|present|current)$/i, "");

  // Превращаем "400 bc"/"400bc" → "400-bc", "800 ad" → "800-ad"
  slug = slug.replace(/\b(\d{1,4})\s*(bc|ad)\b/gi, "$1-$2");

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

// Generate event slug - БЕЗ category prefix, только /event/[slug]
const generateEventSlug = (title, year) => {
  // Извлекаем год из title, если он там есть
  const { text: cleanTitle, year: extractedYear } = extractYearFromEnd(title);
  
  // Определяем финальный год
  let finalYear = year ? String(year).trim() : extractedYear;
  
  // Нормализуем год
  if (finalYear) {
    finalYear = finalYear.toLowerCase()
      .replace(/[–—―−]/g, "-")
      .replace(/\s+/g, "");
  }
  
  // Создаём slug из очищенного текста (без года)
  const titleSlug = slugify(cleanTitle);
  
  // Если года нет, возвращаем только текст
  if (!finalYear) return titleSlug;
  
  // Проверяем, не заканчивается ли titleSlug уже на этот год
  const yearPattern = finalYear.replace(/[()-]/g, '\\$&');
  const endsWithYear = new RegExp(`-${yearPattern}$`, 'i');
  
  if (endsWithYear.test(titleSlug)) {
    return titleSlug;
  }
  
  // Проверяем, не начинается ли titleSlug с года
  const startsWithYear = new RegExp(`^${yearPattern}-`, 'i');
  if (startsWithYear.test(titleSlug)) {
    return titleSlug.replace(startsWithYear, '') + '-' + finalYear;
  }
  
  // Добавляем год в конец
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
  const slug = generateEventSlug(event.title, event.year);
  sitemap += `  <url>
    <loc>https://evid.world/event/${slug}</loc>
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
