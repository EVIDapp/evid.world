# URL Structure Documentation

## Overview

EVID.world использует чистую и SEO-оптимизированную структуру URL с двумя основными типами страниц:

## URL Patterns

### 1. Events (События)
```
https://evid.world/event/[slug]
```

**Примеры:**
- `https://evid.world/event/first-opium-war-1839-1842`
- `https://evid.world/event/battle-of-okinawa-1945`
- `https://evid.world/event/sri-lanka-easter-bombings-2019`
- `https://evid.world/event/titanic-sinking-1912`

### 2. Categories (Категории)
```
https://evid.world/category/[category-slug]
```

**Примеры:**
- `https://evid.world/category/war`
- `https://evid.world/category/earthquake`
- `https://evid.world/category/terror`
- `https://evid.world/category/disaster`

## Slug Generation Rules

### Основные принципы

1. **Год всегда в конце** - год или диапазон годов добавляется только один раз в конце slug
2. **Нет дублирования** - если год уже присутствует в названии, он не дублируется
3. **Нормализация дефисов** - все типы дефисов (–, —, ―) конвертируются в обычный дефис (-)
4. **Чистота** - удаляются скобки, спецсимволы, лишние пробелы

### Примеры преобразований

| Original Title | Year | Generated Slug |
|---------------|------|----------------|
| First Opium War (1839–1842) | 1839-1842 | `first-opium-war-1839-1842` |
| Battle of Okinawa, 1945 | 1945 | `battle-of-okinawa-1945` |
| 2019 Sri Lanka Easter bombings | 2019 | `sri-lanka-easter-bombings-2019` |
| Titanic sinking | 1912 | `titanic-sinking-1912` |
| Chernobyl disaster (1986) | 1986 | `chernobyl-disaster-1986` |

### Специальные случаи

**BC/AD годы:**
- `Battle of Marathon (490 BC)` → `battle-of-marathon-490-bc`
- `Foundation of Rome (753 BC)` → `foundation-of-rome-753-bc`

**Диапазоны лет:**
- `World War I (1914-1918)` → `world-war-i-1914-1918`
- `Vietnam War (1955–1975)` → `vietnam-war-1955-1975`

**Удаление дублей:**
- `2019-sri-lanka-easter-bombings-2019` ❌ → `sri-lanka-easter-bombings-2019` ✅
- `1945-battle-of-okinawa-1945` ❌ → `battle-of-okinawa-1945` ✅

## Redirects

### Старые URL автоматически перенаправляются на новые:

```
/category/*/event/:slug      → /event/:slug
/category/:category/event/:slug → /event/:slug
/category/:category/:slug    → /event/:slug
```

**Примеры:**
- `/category/war/event/titanic-1912` → `/event/titanic-1912`
- `/category/war/titanic-1912` → `/event/titanic-1912`

## Implementation

### TypeScript/JavaScript

```typescript
// src/utils/slugify.ts
export const generateEventSlug = (title: string, year?: string | number): string => {
  const { text: cleanTitle, year: extractedYear } = extractYearFromEnd(title);
  let finalYear = year ? String(year).trim() : extractedYear;
  
  if (finalYear) {
    finalYear = finalYear.toLowerCase()
      .replace(/[–—―−]/g, "-")
      .replace(/\s+/g, "");
  }
  
  const titleSlug = slugify(cleanTitle);
  
  if (!finalYear) return titleSlug;
  
  // Check if year already at the end
  const endsWithYear = new RegExp(`-${finalYear}$`, 'i');
  if (endsWithYear.test(titleSlug)) {
    return titleSlug;
  }
  
  // Check if year at the beginning (move to end)
  const startsWithYear = new RegExp(`^${finalYear}-`, 'i');
  if (startsWithYear.test(titleSlug)) {
    return titleSlug.replace(startsWithYear, '') + '-' + finalYear;
  }
  
  return `${titleSlug}-${finalYear}`;
};
```

### Node.js (Sitemap Generation)

Все скрипты генерации sitemap используют идентичную логику:
- `scripts/generate-sitemap.js`
- `scripts/generate-complete-sitemap.js`
- `scripts/generate-full-sitemap.js`

## SEO Benefits

1. **Читабельность** - URL понятны людям и поисковикам
2. **Уникальность** - год в конце обеспечивает уникальность для одноимённых событий
3. **Консистентность** - единый формат для всех событий
4. **Предсказуемость** - легко угадать URL события по его названию

## Migration

При изменении slug событий:
1. Старые URL добавляются в `public/_redirects` с 301 редиректом
2. Обновляется `public/sitemap.xml`
3. Canonical URLs обновляются автоматически через `EventMeta` компонент

## Validation

Для проверки корректности slug'ов используйте:
```bash
node scripts/check-year-ranges-in-urls.js
```

Скрипт проверит:
- Отсутствие дублирования годов
- Корректность диапазонов годов
- Правильность позиции года в slug
