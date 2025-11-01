// Универсальная и SEO-дружественная функция slugify для EVID.world
export const slugify = (text: string): string => {
  let slug = text.toLowerCase().trim();

  // Удаляем содержимое скобок (годы и прочее обработаем отдельно)
  slug = slug.replace(/\([^)]*\)/g, '');

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
  'man-made disaster': 'man-made-disaster'
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
      let yearStr = yearInParentheses[1];
      
      // Удаляем слова "ongoing", "present", "current" и запятые
      yearStr = yearStr.replace(/,?\s*(ongoing|present|current)\s*/gi, '');
      
      // Заменяем различные виды дефисов на обычный дефис
      yearStr = yearStr.replace(/[–—]/g, '-');
      
      // Удаляем все пробелы
      yearStr = yearStr.replace(/\s+/g, '');
      
      // Удаляем начальные/конечные дефисы и запятые
      yearStr = yearStr.replace(/^[-,]+|[-,]+$/g, '');
      
      eventYear = yearStr;
    }
  }

  // Проверяем, есть ли год или диапазон лет уже в слаге
  // Поддерживаем форматы: -1234, -1234-5678, -1234-bc, -1234-ad, -1234-ce
  const yearPattern = /\d{1,4}(-\d{1,4})?(-bc|-ad|-ce)?$/;
  const alreadyHasYear = yearPattern.test(titleSlug);
  
  // Проверяем, начинается ли слаг с года (например, "2022-mogadishu-bombings")
  const startsWithYear = /^\d{4}-/.test(titleSlug);

  // Формируем слаг события
  let eventSlug = titleSlug;
  
  // Если год уже есть в конце слага или в начале, не добавляем его повторно
  if (!alreadyHasYear && !startsWithYear && eventYear) {
    // Очищаем год от CE/AD/BC суффиксов
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
      let yearStr = yearInParentheses[1];
      
      // Удаляем слова "ongoing", "present", "current" и запятые
      yearStr = yearStr.replace(/,?\s*(ongoing|present|current)\s*/gi, '');
      
      // Заменяем различные виды дефисов на обычный дефис
      yearStr = yearStr.replace(/[–—]/g, '-');
      
      // Удаляем все пробелы
      yearStr = yearStr.replace(/\s+/g, '');
      
      // Удаляем начальные/конечные дефисы и запятые
      yearStr = yearStr.replace(/^[-,]+|[-,]+$/g, '');
      
      eventYear = yearStr;
    }
  }

  // Проверяем, есть ли год или диапазон лет уже в слаге
  const yearPattern = /\d{1,4}(-\d{1,4})?(-bc|-ad|-ce)?$/;
  const alreadyHasYear = yearPattern.test(titleSlug);
  
  // Проверяем, начинается ли слаг с года
  const startsWithYear = /^\d{4}-/.test(titleSlug);

  if (alreadyHasYear || startsWithYear) {
    return titleSlug;
  }

  if (eventYear) {
    // Очищаем год от CE/AD/BC суффиксов
    const cleanYear = eventYear.toLowerCase().replace(/\s*(ce|ad|bc)\s*$/i, '');
    return `${titleSlug}-${cleanYear}`;
  }

  return titleSlug;
};
