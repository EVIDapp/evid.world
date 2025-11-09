import { getCachedImage, setCachedImage, clearImageCache } from './imageCache';

// Clear cache on module load to prevent stale data
clearImageCache();

const wikiTextCache = new Map<string, string | null>();

// Fallback: Try Wikimedia Action API if REST API fails
const getWikimediaImage = async (title: string): Promise<string | null> => {
  try {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
    
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
    
    if (!pages) return null;
    
    // Get first page (there should only be one)
    const page = Object.values(pages)[0] as any;
    
    // Try thumbnail first, then original
    if (page.thumbnail?.source) {
      return page.thumbnail.source;
    } else if (page.original?.source) {
      return page.original.source;
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Wikimedia API error:', error);
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
  // Check cache first - only return if we have a successful cached image
  const cached = getCachedImage(wikiUrl);
  if (cached) {
    console.log('✓ Image loaded from cache:', wikiUrl);
    return cached;
  }
  
  try {
    // Extract article title from Wikipedia URL
    const match = wikiUrl.match(/\/wiki\/(.+)$/);
    if (!match) {
      console.log('✗ Invalid Wikipedia URL format:', wikiUrl);
      return null;
    }
    
    const title = decodeURIComponent(match[1]);
    console.log('→ Fetching image for:', title);
    
    // Try Wikipedia REST API first (faster, optimized)
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(apiUrl, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    
    let imageUrl: string | null = null;
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.thumbnail?.source) {
        const thumbnailUrl = data.thumbnail.source;
        imageUrl = thumbnailUrl.replace(/\/\d+px-/, '/400px-');
      } else if (data.originalimage?.source) {
        imageUrl = data.originalimage.source;
      }
    }
    
    // Fallback to Wikimedia Action API if REST API didn't return image
    if (!imageUrl) {
      console.log('→ Trying Wikimedia Action API fallback for:', title);
      imageUrl = await getWikimediaImage(title);
    }
    
    // Cache and return result
    if (imageUrl) {
      console.log('✓ Image found and cached:', title);
      setCachedImage(wikiUrl, imageUrl);
    } else {
      console.log('✗ No image available from any source:', title);
    }
    
    return imageUrl;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('✗ Error fetching Wikipedia image:', error);
    }
    return null;
  }
};
