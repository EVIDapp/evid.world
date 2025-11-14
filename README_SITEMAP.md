# Sitemap Generation

## Overview
Карта сайта обновлена для использования новой SEO-оптимизированной структуры URL с правильной генерацией slug'ов без дублирования годов.

## URL Structure

EVID.world использует две основные структуры URL:

### События (Events)
```
https://evid.world/event/[slug]
```
Где `slug` генерируется из названия события с годом в конце (без дублирования).

**Примеры:**
- `/event/first-opium-war-1839-1842`
- `/event/battle-of-okinawa-1945`
- `/event/sri-lanka-easter-bombings-2019`

### Категории (Categories)
```
https://evid.world/category/[category-slug]
```

**Примеры:**
- `/category/war`
- `/category/earthquake`
- `/category/disaster`

## Генерация Sitemap

Доступны три скрипта для генерации sitemap:

### 1. Основной скрипт (рекомендуется)
```bash
node scripts/generate-sitemap.js
```

### 2. Полный sitemap со всеми событиями
```bash
node scripts/generate-full-sitemap.js
```

### 3. Комплексный sitemap с категориями
```bash
node scripts/generate-complete-sitemap.js
```

Все скрипты используют единую логику генерации slug'ов из `src/utils/slugify.ts`.

## Проверка корректности URL

Для проверки событий с дублированием года в URL:

```bash
node scripts/find-duplicate-year-slugs.js
```

Скрипт найдёт события вида:
- ❌ `2019-sri-lanka-easter-bombings-2019`
- ✅ `sri-lanka-easter-bombings-2019`

## Slug Generation Rules

1. **Год всегда в конце** - год добавляется только один раз в конец slug
2. **Нет дублирования** - если год уже есть в названии, он не дублируется
3. **Нормализация** - все типы дефисов конвертируются в обычный дефис
4. **Чистота** - удаляются скобки, спецсимволы, лишние пробелы

Подробнее в [URL_STRUCTURE.md](../URL_STRUCTURE.md).

## SEO Features

Each event page includes:
- ✅ Unique URL with readable slug
- ✅ Meta title, description, and keywords
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ JSON-LD structured data (Schema.org Event)
- ✅ Dynamic meta tags via EventMeta component

## Submitting to Search Engines

After generating the complete sitemap:

1. **Google Search Console**: https://search.google.com/search-console
   - Add property for evid.world
   - Submit sitemap URL: `https://evid.world/sitemap.xml`

2. **Bing Webmaster Tools**: https://www.bing.com/webmasters
   - Add site
   - Submit sitemap URL: `https://evid.world/sitemap.xml`

3. **Yandex Webmaster**: https://webmaster.yandex.com
   - Add site
   - Submit sitemap URL: `https://evid.world/sitemap.xml`

## Current Implementation

The sitemap currently includes:
- Homepage (priority: 1.0)
- Category pages (priority: 0.7)
- Sample event pages (priority: 0.8)

Run the generation script to add all remaining events!
