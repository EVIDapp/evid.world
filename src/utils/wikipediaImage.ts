import { getCachedImage, setCachedImage } from './imageCache';

const wikiTextCache = new Map<string, string | null>();

// Normalize URL to https and proper encoding
const normalizeImageUrl = (url: string): string => {
  if (!url) return '';
  // Force HTTPS
  let normalized = url.replace(/^http:/, 'https:');
  // Ensure it's from upload.wikimedia.org
  if (!normalized.includes('upload.wikimedia.org')) return '';
  return normalized;
};

// Main Wikipedia Action API call
const getWikipediaActionImage = async (title: string, lang: string = 'en'): Promise<string | null> => {
  try {
    // Normalize title: spaces to underscores, URL encode
    const normalizedTitle = title.replace(/ /g, '_');
    const encodedTitle = encodeURIComponent(normalizedTitle);
    
    const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail|original&pithumbsize=1200&redirects=1&format=json&formatversion=2&origin=*&titles=${encodedTitle}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(apiUrl, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages || pages.length === 0) return null;
    
    const page = pages[0];
    
    // Check if page exists
    if (page.missing || !page.pageid) {
      return null;
    }
    
    // Try thumbnail first (higher resolution), then original
    let imageUrl: string | null = null;
    if (page.thumbnail?.source) {
      imageUrl = normalizeImageUrl(page.thumbnail.source);
    } else if (page.original?.source) {
      imageUrl = normalizeImageUrl(page.original.source);
    }
    
    return imageUrl;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Wikipedia Action API error:', error);
    }
    return null;
  }
};

// Fallback: Try Wikimedia Commons
const getWikimediaCommonsImage = async (fileName: string): Promise<string | null> => {
  try {
    const normalizedFileName = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
    const encodedFileName = encodeURIComponent(normalizedFileName);
    
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodedFileName}&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1200&format=json&formatversion=2&origin=*`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages || pages.length === 0) return null;
    
    const page = pages[0];
    const imageInfo = page.imageinfo?.[0];
    
    if (!imageInfo) return null;
    
    // Use thumburl if available, otherwise url
    const imageUrl = imageInfo.thumburl || imageInfo.url;
    return imageUrl ? normalizeImageUrl(imageUrl) : null;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Wikimedia Commons API error:', error);
    }
    return null;
  }
};

export const getWikipediaText = async (wikiUrl: string): Promise<string | null> => {
  // Check cache first
  const cached = wikiTextCache.get(wikiUrl);
  if (cached !== undefined) {
    return cached;
  }
  
  try {
    // Extract article title from Wikipedia URL
    const match = wikiUrl.match(/\/wiki\/(.+)$/);
    if (!match) {
      wikiTextCache.set(wikiUrl, null);
      return null;
    }
    
    const title = decodeURIComponent(match[1]);
    
    // Use Wikipedia REST API to get page summary
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      wikiTextCache.set(wikiUrl, null);
      return null;
    }
    
    const data = await response.json();
    
    // Get extract (summary text)
    const text = data.extract || null;
    
    // Cache the result
    wikiTextCache.set(wikiUrl, text);
    return text;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error fetching Wikipedia text:', error);
    }
    wikiTextCache.set(wikiUrl, null);
    return null;
  }
};

export const getWikipediaImage = async (wikiUrl: string): Promise<string | null> => {
  // Check cache first
  const cached = getCachedImage(wikiUrl);
  if (cached) {
    return cached;
  }
  
  try {
    // Extract article title and language from Wikipedia URL
    const urlMatch = wikiUrl.match(/https?:\/\/([a-z]{2})\.wikipedia\.org\/wiki\/(.+)$/);
    if (!urlMatch) {
      return null;
    }
    
    const lang = urlMatch[1] || 'en';
    const title = decodeURIComponent(urlMatch[2]);
    
    // Step 1: Try Wikipedia Action API (primary method)
    let imageUrl = await getWikipediaActionImage(title, lang);
    
    // Step 2: If lang is not 'en', try English Wikipedia
    if (!imageUrl && lang !== 'en') {
      imageUrl = await getWikipediaActionImage(title, 'en');
    }
    
    // Step 3: If still no image, try Russian Wikipedia
    if (!imageUrl && lang !== 'ru') {
      imageUrl = await getWikipediaActionImage(title, 'ru');
    }
    
    // Cache and return if successful
    if (imageUrl) {
      setCachedImage(wikiUrl, imageUrl);
      return imageUrl;
    }
    
    // Do NOT cache empty results
    return null;
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error);
    return null;
  }
};
