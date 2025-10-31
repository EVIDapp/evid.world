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

// Маппинг типов событий в слаги категорий
export const categorySlugMap: Record<string, string> = {
  'war': 'war',
  'earthquake': 'earthquake',
  'terror': 'terror-attack',
  'archaeology': 'archaeology',
  'fire': 'wildfire',
  'disaster': 'disaster',
  'tsunami': 'tsunami',
  'meteorite': 'meteorite',
  'epidemic': 'epidemic',
  'man-made disaster': 'man-made-disaster',
  'culture': 'culture'
};

// Генерация полного пути события с категорией: /category/[category-slug]/[event-slug]
export const generateEventSlug = (title: string, category: string, year?: string): string => {
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

  // Проверяем, есть ли год или диапазон лет уже в слаге
  // Поддерживаем форматы: -1234, -1234-5678, -1234-bc, -1234-ad, -1234-ce
  const yearPattern = /\d{1,4}(-\d{1,4})?(-bc|-ad|-ce)?$/;
  const alreadyHasYear = yearPattern.test(titleSlug);

  // Формируем слаг события
  let eventSlug = titleSlug;
  
  // Если год уже есть в конце слага, не добавляем его повторно
  if (!alreadyHasYear && eventYear) {
    // Очищаем год от CE/AD/BC суффиксов для добавления
    const cleanYear = eventYear.toLowerCase().replace(/\s*(ce|ad|bc)\s*$/i, '');
    eventSlug = `${titleSlug}-${cleanYear}`;
  }

  // Получаем слаг категории
  const categorySlug = categorySlugMap[category] || slugify(category);

  // Возвращаем полный путь
  return `${categorySlug}/${eventSlug}`;
};

// Вспомогательная функция для получения только event slug без категории
export const getEventSlugOnly = (title: string, year?: string): string => {
  const titleSlug = slugify(title);

  let eventYear = year;
  if (!eventYear) {
    const yearInParentheses = title.match(/\(([^)]+)\)/);
    if (yearInParentheses) {
      eventYear = yearInParentheses[1]
        .replace(/–/g, '-')
        .replace(/—/g, '-')
        .replace(/\s+/g, '');
    }
  }

  // Проверяем, есть ли год или диапазон лет уже в слаге
  const yearPattern = /\d{1,4}(-\d{1,4})?(-bc|-ad|-ce)?$/;
  const alreadyHasYear = yearPattern.test(titleSlug);

  if (alreadyHasYear) {
    return titleSlug;
  }

  if (eventYear) {
    // Очищаем год от CE/AD/BC суффиксов для добавления
    const cleanYear = eventYear.toLowerCase().replace(/\s*(ce|ad|bc)\s*$/i, '');
    return `${titleSlug}-${cleanYear}`;
  }

  return titleSlug;
};
