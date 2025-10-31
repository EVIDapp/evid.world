# SSR Implementation Guide for EVID.world

## Current Status

### ✅ Implemented SEO Optimizations

1. **Dynamic Meta Tags** - All event and category pages have proper meta tags:
   - Title tags with keywords
   - Meta descriptions (max 160 chars)
   - Open Graph tags (og:title, og:description, og:image, og:url)
   - Twitter Card tags
   - Canonical URLs
   - Structured data (Schema.org/Event)

2. **Fixed URL Generation** - All event URLs now follow consistent format:
   - No duplicate years (fixed: `war-1701-1714-1701` → `war-1701-1714`)
   - Year ranges handled correctly
   - BC/AD dates properly formatted
   - Ongoing events without `-ongoing` suffix

3. **Sitemap** - Complete XML sitemap with all events and categories

### 🔄 SSR Options for Better Indexing

**Current limitation**: Vite + React = Client-Side Rendering (CSR)
Google can index CSR pages, but SSR/SSG is better for SEO.

## Recommended Solutions

### Option 1: Deploy to Vercel/Netlify with SSR ⭐ (Best)

**Vercel** and **Netlify** support React SSR out of the box:

```bash
# Deploy to Vercel
npm i -g vercel
vercel

# Deploy to Netlify
npm i -g netlify-cli
netlify deploy --prod
```

Both platforms will:
- Pre-render pages at build time
- Serve full HTML to Google
- Cache pages for fast loading
- Support dynamic routes

### Option 2: Add Vite SSR Plugin

Install `vite-plugin-ssr`:

```bash
npm install vite-plugin-ssr
```

Update `vite.config.ts`:

```typescript
import ssr from 'vite-plugin-ssr/plugin';

export default {
  plugins: [react(), ssr()],
};
```

Then create `pages/` directory structure and configure SSR.

### Option 3: Pre-render Static Pages

Use `vite-plugin-prerender`:

```bash
npm install vite-plugin-prerender
```

This generates static HTML for all routes at build time.

### Option 4: Use Next.js (Major Migration)

Migrate to Next.js for native SSR/SSG:
- `getStaticProps` for event pages
- `getStaticPaths` for dynamic routes
- Automatic code splitting

## Quick Win: Improve Current Setup

Even without full SSR, improve indexing:

1. **Submit Sitemap to Google Search Console**
   - Go to: https://search.google.com/search-console
   - Add property: `evid.world`
   - Submit sitemap: `https://evid.world/sitemap.xml`

2. **Request Indexing**
   - In Search Console, use "URL Inspection" tool
   - Request indexing for key pages

3. **Add robots.txt Headers**
   Already configured in `public/robots.txt`

4. **Use Google's Rich Results Test**
   - Test: https://search.google.com/test/rich-results
   - Verify Schema.org markup is working

## Performance Checklist

- ✅ Meta tags dynamically generated
- ✅ Canonical URLs set
- ✅ Structured data (Schema.org/Event)
- ✅ Open Graph + Twitter Cards
- ✅ Sitemap.xml generated
- ✅ robots.txt configured
- ⏳ SSR/Pre-rendering (needs deployment platform)

## Next Steps

1. **Deploy to Vercel** (recommended for instant SSR)
2. **Submit sitemap** to Google Search Console
3. **Monitor indexing** in Search Console
4. **Test with Google's tools** (Rich Results, Mobile-Friendly)

---

**Note**: Current setup is SEO-optimized for CSR. For maximum Google visibility, deploy to Vercel/Netlify for automatic SSR.
