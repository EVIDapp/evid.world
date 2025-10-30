// Универсальная и SEO-дружественная функция slugify для EVID.world
export const slugify = (text: string): string => {
  let slug = text.toLowerCase().trim();

  // Исправление: диапазоны лет (20122026 → 2012-2026)
  slug = slug.replace(/(\d{3,4})(\d{3,4})/g, '$1-$2');

  // Удаляем "ongoing" и похожие маркеры
  slug = slug.replace(/-?(ongoing|present|current)$/g, '');

  // Исправляем BC и AD — превращаем в "-bc" или "-ad"
  slug = slug.replace(/\b(\d{1,4})\s*bc\b/g, '$1-bc');
  slug = slug.replace(/\b(\d{1,4})\s*ad\b/g, '$1-ad');

  // Удаляем повтор годов или дефисы вроде "--605"
  slug = slug.replace(/(-\d{1,4})-\1/g, '$1');

  // Заменяем пробелы и подчёркивания на дефисы
  slug = slug.replace(/[\s_]+/g, '-');

  // Удаляем все лишние символы кроме букв, цифр и дефисов
  slug = slug.replace(/[^a-z0-9-]/g, '');

  // Убираем двойные дефисы
  slug = slug.replace(/--+/g, '-');

  // Убираем дефисы в начале и конце
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
};

<<<<<<< HEAD
/**
 * Extract year from title if it's in parentheses at the end
 * Examples: 
 * - "Battle of Actium (31 BC)" -> { title: "Battle of Actium", year: "31-bc" }
 * - "Gothic War (376–382)" -> { title: "Gothic War", year: "376-382" }
 * - "Early Muslim conquests (7th century)" -> { title: "Early Muslim conquests", year: "7th-century" }
 */
const extractYearFromTitle = (title: string): { cleanTitle: string; extractedYear: string | null } => {
  // Pattern to match year in parentheses at the end: (year) or (year1-year2) or (year BC) or (Nth century)
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
  
  // Handle BC dates: "31 BC" -> "31-bc"
  if (yearPart.toLowerCase().includes('bc')) {
    yearPart = yearPart.toLowerCase().replace(/\s*bc\s*/gi, '').trim() + '-bc';
  }
  
  // Handle year ranges with various dash types: "1219–1221" or "1219-1221" -> "1219-1221"
  // Replace em dash (–), en dash (–), or other dashes with regular hyphen
  yearPart = yearPart.replace(/[–—]/g, '-');
  
  // Clean up spaces around dashes
  yearPart = yearPart.replace(/\s*-\s*/g, '-');
  
  return { cleanTitle, extractedYear: yearPart };
};

export const generateEventSlug = (title: string, year?: string): string => {
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
  
  // Check if title starts with year pattern (e.g., "1964 Alaska Earthquake")
  const yearAtStartPattern = /^(\d{1,4}(?:-\d{1,4})?(?:\s*bc)?)\s+(.+)$/i;
  const yearMatch = cleanTitle.match(yearAtStartPattern);
  
  if (yearMatch) {
    // Move year from start to end
    cleanTitle = yearMatch[2];
  }
  
  // Process BC years: ensure only one -bc suffix
  if (finalYear.toLowerCase().includes('bc')) {
    // Remove all BC mentions first
    finalYear = finalYear.replace(/\s*bc/gi, '').trim();
    // Add single -bc at the end
    finalYear = `${finalYear}-bc`;
  }
  
  // Replace various dash types with regular hyphen
  finalYear = finalYear.replace(/[–—]/g, '-');
  
  // Clean up the year string: remove duplicate dashes and spaces
  finalYear = finalYear.replace(/\s+/g, '-').replace(/--+/g, '-');
  
  const titleSlug = slugify(cleanTitle);
  
  // Ensure no duplicate year in slug
  const yearPattern = finalYear.replace(/-/g, '\\-');
  const duplicatePattern = new RegExp(`-${yearPattern}$`);
  
  if (titleSlug.match(duplicatePattern)) {
    return titleSlug; // Year already in title slug
  }
  
  return `${titleSlug}-${finalYear}`;
=======
// Генерация слага события с годом в конце
export const generateEventSlug = (title: string, year?: string): string => {
  const titleSlug = slugify(title);

  // Если год указан — добавляем в конец, иначе оставляем только название
  return year ? `${titleSlug}-${year}` : titleSlug;
>>>>>>> be0bb2a (Fix slugify function for proper SEO URLs)
};
