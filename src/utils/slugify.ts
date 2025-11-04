// Универсальная и SEO-дружественная функция slugify для EVID.world
export const slugify = (text: string): string => {
  let slug = text.toLowerCase().trim();

  // Нормализуем все типы дефисов к обычному "-" ДО обработки диапазонов
  slug = slug.replace(/[–—―−]/g, "-");

  // Удаляем скобки и их содержимое (типа "(1816–1828)")
  slug = slug.replace(/\s*\([^)]*\)/g, "");

  // Исправление: слипшиеся диапазоны лет уже после замены дефисов
  // Паттерн: 4 цифры сразу после 4 цифр -> разделяем дефисом
  slug = slug.replace(/(\d{4})(\d{4})/g, "$1-$2");

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
  
  // Если year не передан, попробуем извлечь из title
  let y = (year ?? "").trim();
  
  if (!y) {
    // Ищем год в скобках в конце title: "(1816–1828)" или "(1980)"
    const yearInParentheses = title.match(/\(([^)]+)\)\s*$/);
    if (yearInParentheses) {
      y = yearInParentheses[1].trim();
    }
  }
  
  if (!y) return titleSlug;

  // Нормализуем год для slug (удаляем минус для BC лет)
  const yearSlug = y.toLowerCase().replace(/^-/, "");
  
  // если уже заканчивается на "-год" (в т.ч. "-405-bc", "-1980"), ничего не добавляем
  const endsWithYear = new RegExp(`-${yearSlug.replace(/-/g, '\\-')}$`);
  return endsWithYear.test(titleSlug) ? titleSlug : `${titleSlug}-${yearSlug}`;
};