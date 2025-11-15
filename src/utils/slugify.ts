// Извлекает год или диапазон годов из конца строки
const extractYearFromEnd = (text: string): { text: string; year: string } => {
  const normalized = text.replace(/[–—―−]/g, "-");
  
  // Паттерны для извлечения года из конца:
  // - "1945", "2019"
  // - "1839-1842", "1968-1969" (диапазоны)
  // - "405-bc", "800-ad"
  // - В скобках: "(1816-1828)", "(1980)"
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

// Универсальная и SEO-дружественная функция slugify для EVID.world
export const slugify = (text: string): string => {
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

// Слаг события с годом в конце, БЕЗ дублирования года
export const generateEventSlug = (title: string, year?: string | number): string => {
  // Извлекаем год из title, если он там есть
  const { text: cleanTitle, year: extractedYear } = extractYearFromEnd(title);
  
  // Определяем финальный год: либо переданный параметр, либо извлечённый из title
  let finalYear = year ? String(year).trim() : extractedYear;
  
  // Нормализуем год: заменяем все типы дефисов на обычные
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
  const yearPattern = finalYear.replace(/[()-]/g, '\\$&'); // Экранируем спецсимволы
  const endsWithYear = new RegExp(`-${yearPattern}$`, 'i');
  
  if (endsWithYear.test(titleSlug)) {
    // Год уже есть в конце, ничего не добавляем
    return titleSlug;
  }
  
  // Проверяем, не начинается ли titleSlug с года (случай типа "2019-sri-lanka-easter-bombings")
  const startsWithYear = new RegExp(`^${yearPattern}-`, 'i');
  if (startsWithYear.test(titleSlug)) {
    // Убираем год из начала и добавляем в конец
    return titleSlug.replace(startsWithYear, '') + '-' + finalYear;
  }
  
  // Добавляем год в конец
  let finalSlug = `${titleSlug}-${finalYear}`;
  
  // Пост-обработка: убираем множественные дефисы и дефисы по краям
  finalSlug = finalSlug.replace(/-{2,}/g, "-");
  finalSlug = finalSlug.replace(/^-+|-+$/g, "");
  
  return finalSlug;
};