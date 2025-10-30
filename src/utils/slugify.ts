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

  // Если год указан — добавляем в конец, иначе оставляем только название
  return year ? `${titleSlug}-${year}` : titleSlug;
};
