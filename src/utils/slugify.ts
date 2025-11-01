// Универсальная и SEO-дружественная функция slugify для EVID.world
export const slugify = (text: string): string => {
  let slug = text.toLowerCase().trim();

  // Нормализуем все типы дефисов к обычному "-"
  slug = slug.replace(/[–—―−]/g, "-");

  // Исправление: диапазоны лет (20122026 → 2012-2026)
  slug = slug.replace(/(\d{3,4})(\d{3,4})/g, "$1-$2");

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

// Слаг события с годом в конце, БЕЗ дублирования года
export const generateEventSlug = (title: string, year?: string): string => {
  const titleSlug = slugify(title);
  const y = (year ?? "").toLowerCase().trim();
  if (!y) return titleSlug;

  // если уже заканчивается на "-год" (в т.ч. "-405-bc"), ничего не добавляем
  const endsWithYear = new RegExp(`-${y}$`);
  return endsWithYear.test(titleSlug) ? titleSlug : `${titleSlug}-${y}`;
};