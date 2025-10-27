# Sitemap Generation

## Overview
The sitemap has been updated to include individual event pages with SEO-friendly URLs.

## How to Generate Full Sitemap

To generate a complete sitemap with all events from `events-clean.json`, run:

```bash
node scripts/generate-sitemap.js
```

This will:
1. Read all events from `public/events-clean.json`
2. Generate SEO-friendly slugs for each event (e.g., `titanic-sinking-1912`)
3. Create a complete `sitemap.xml` in the `public` folder
4. Include all event pages with proper priority and change frequency

## URL Structure

Event pages follow this pattern:
- `/event/[slug]` where slug is generated from event title + year
- Example: `/event/titanic-sinking-1912`
- Example: `/event/chernobyl-disaster-1986`

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
