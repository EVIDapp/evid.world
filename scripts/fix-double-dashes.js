#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Читаем события
const eventsPath = path.join(__dirname, '../public/events.json');
const rawData = fs.readFileSync(eventsPath, 'utf-8');
const events = JSON.parse(rawData);

// Функции из slugify.ts (копируем логику)
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
  
  let finalSlug = `${titleSlug}-${finalYear}`;
  
  // Пост-обработка: убираем множественные дефисы и дефисы по краям
  finalSlug = finalSlug.replace(/-{2,}/g, "-");
  finalSlug = finalSlug.replace(/^-+|-+$/g, "");
  
  return finalSlug;
};

// Находим события с двойными дефисами
const eventsWithDoubleDashes = [];
const redirects = [];

events.forEach(event => {
  const oldSlug = generateEventSlug(event.title, event.year);
  
  if (oldSlug.includes('--')) {
    const newSlug = oldSlug.replace(/-{2,}/g, '-');
    eventsWithDoubleDashes.push({
      id: event.id,
      title: event.title,
      year: event.year,
      oldSlug,
      newSlug
    });
    
    redirects.push(`/event/${oldSlug} /event/${newSlug} 301!`);
  }
});

console.log('\n=== События с двойными дефисами ===\n');
console.log(`Найдено: ${eventsWithDoubleDashes.length} событий\n`);

if (eventsWithDoubleDashes.length > 0) {
  eventsWithDoubleDashes.forEach(event => {
    console.log(`ID: ${event.id}`);
    console.log(`Название: ${event.title}`);
    console.log(`Старый slug: ${event.oldSlug}`);
    console.log(`Новый slug:  ${event.newSlug}`);
    console.log('---');
  });

  console.log('\n=== Редиректы для _redirects ===\n');
  redirects.forEach(redirect => console.log(redirect));
  
  // Сохраняем отчет
  const report = {
    totalFound: eventsWithDoubleDashes.length,
    events: eventsWithDoubleDashes,
    redirects
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../double-dash-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✓ Отчет сохранен в double-dash-report.json');
  
  // Добавляем редиректы в _redirects файл
  const redirectsPath = path.join(__dirname, '../public/_redirects');
  let redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
  
  // Добавляем новые редиректы перед последним правилом
  const newRedirects = '\n# Fix double-dash slugs\n' + redirects.join('\n') + '\n';
  redirectsContent = redirectsContent.replace(
    /\n# Serve index\.html/,
    newRedirects + '\n# Serve index.html'
  );
  
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log('✓ Редиректы добавлены в public/_redirects');
} else {
  console.log('✓ Событий с двойными дефисами не найдено!');
}

console.log('\n=== Готово ===\n');
