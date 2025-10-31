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

// Генерация слага события с годом в конце
export const generateEventSlug = (title: string, year?: string): string => {
  const titleSlug = slugify(title);

  // Извлекаем год из заголовка, если year не передан
  let eventYear = year;
  if (!eventYear) {
    // Извлекаем год из скобок в заголовке (например, "War of Spanish Succession (1701-1714)")
    const yearInParentheses = title.match(/\(([^)]+)\)/);
    if (yearInParentheses) {
      eventYear = yearInParentheses[1]
        .replace(/–/g, '-') // заменяем em dash на обычный дефис
        .replace(/—/g, '-') // заменяем en dash на обычный дефис
        .replace(/\s+/g, ''); // удаляем пробелы
    }
  }

  // Проверяем, заканчивается ли слаг на год или диапазон лет
  const endsWithYearPattern = /-(\d{1,4}(-\d{1,4})?(-bc|-ad)?)$/;
  const alreadyHasYear = endsWithYearPattern.test(titleSlug);

  // Если год уже есть в конце слага, не добавляем его повторно
  if (alreadyHasYear) {
    return titleSlug;
  }

  // Если год указан и его нет в слаге — добавляем в конец
  if (eventYear) {
    return `${titleSlug}-${eventYear}`;
  }

  // Если года нет вообще, возвращаем только слаг заголовка
  return titleSlug;
};
