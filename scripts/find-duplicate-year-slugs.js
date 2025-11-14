import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events data
const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

// Извлекает год или диапазон годов из конца строки
const extractYearFromEnd = (text) => {
  const normalized = text.replace(/[–—―−]/g, "-");
  
  const yearPatterns = [
    /\((\d{1,4}(?:-\d{1,4})?(?:-(?:bc|ad))?)\)\s*$/i,
    /,?\s*(\d{1,4}(?:-\d{1,4})?(?:-(?:bc|ad))?)\s*$/i,
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

const slugify = (text) => {
  let slug = text.toLowerCase().trim();
  slug = slug.replace(/[–—―−]/g, "-");
  slug = slug.replace(/\s*\([^)]*\)/g, "");
  slug = slug.replace(/-?(?:ongoing|present|current)$/i, "");
  slug = slug.replace(/\b(\d{1,4})\s*(bc|ad)\b/gi, "$1-$2");
  slug = slug.replace(/[\s_]+/g, "-");
  slug = slug.replace(/[^a-z0-9-]/g, "");
  slug = slug.replace(/-+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
};

const generateEventSlug = (title, year) => {
  const { text: cleanTitle, year: extractedYear } = extractYearFromEnd(title);
  let finalYear = year ? String(year).trim() : extractedYear;
  
  if (finalYear) {
    finalYear = finalYear.toLowerCase()
      .replace(/[–—―−]/g, "-")
      .replace(/\s+/g, "");
  }
  
  const titleSlug = slugify(cleanTitle);
  if (!finalYear) return titleSlug;
  
  const yearPattern = finalYear.replace(/[()-]/g, '\\$&');
  const endsWithYear = new RegExp(`-${yearPattern}$`, 'i');
  
  if (endsWithYear.test(titleSlug)) {
    return titleSlug;
  }
  
  const startsWithYear = new RegExp(`^${yearPattern}-`, 'i');
  if (startsWithYear.test(titleSlug)) {
    return titleSlug.replace(startsWithYear, '') + '-' + finalYear;
  }
  
  return `${titleSlug}-${finalYear}`;
};

// Find events with duplicate years in slug
console.log('🔍 Поиск событий с дублированием года в slug...\n');

const duplicateYearEvents = [];

events.forEach(event => {
  const slug = generateEventSlug(event.title, event.year);
  
  // Check for patterns like "2019-...-2019" or "1945-...-1945"
  const yearPattern = /(\d{1,4}(?:-\d{1,4})?(?:-(?:bc|ad))?)$/i;
  const yearMatch = slug.match(yearPattern);
  
  if (yearMatch) {
    const yearAtEnd = yearMatch[1];
    const slugWithoutYear = slug.replace(new RegExp(`-${yearAtEnd}$`, 'i'), '');
    
    // Check if the year also appears at the start
    const startsWithSameYear = new RegExp(`^${yearAtEnd}-`, 'i').test(slugWithoutYear);
    
    if (startsWithSameYear) {
      duplicateYearEvents.push({
        id: event.id,
        title: event.title,
        year: event.year,
        oldSlug: `${yearAtEnd}-${slugWithoutYear.replace(new RegExp(`^${yearAtEnd}-`, 'i'), '')}-${yearAtEnd}`,
        newSlug: slug,
        url: `https://evid.world/event/${slug}`
      });
    }
  }
});

if (duplicateYearEvents.length === 0) {
  console.log('✅ Отлично! Ни одного события с дублированием года не найдено.\n');
  console.log(`Проверено событий: ${events.length}`);
} else {
  console.log(`❌ Найдено событий с дублированием года: ${duplicateYearEvents.length}\n`);
  
  console.log('📋 Список событий с проблемами:\n');
  duplicateYearEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title}`);
    console.log(`   ID: ${event.id}`);
    console.log(`   Старый slug: ${event.oldSlug}`);
    console.log(`   Новый slug:  ${event.newSlug}`);
    console.log(`   URL: ${event.url}`);
    console.log('');
  });
  
  // Save report
  const reportPath = path.join(__dirname, 'duplicate-year-slugs-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(duplicateYearEvents, null, 2));
  console.log(`📄 Полный отчёт сохранён: ${reportPath}\n`);
  
  // Generate redirects
  console.log('📝 Рекомендуемые редиректы для public/_redirects:\n');
  duplicateYearEvents.forEach(event => {
    console.log(`/event/${event.oldSlug} /event/${event.newSlug} 301!`);
  });
}

console.log(`\n📊 Статистика:`);
console.log(`   Всего событий: ${events.length}`);
console.log(`   С дублями года: ${duplicateYearEvents.length}`);
console.log(`   Корректных: ${events.length - duplicateYearEvents.length}`);
