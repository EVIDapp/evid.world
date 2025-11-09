import { getCachedImage, setCachedImage } from './imageCache';

const wikiTextCache = new Map<string, string | null>();

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
    return cached;
  }
  
  try {
    // Extract article title from Wikipedia URL
    const match = wikiUrl.match(/\/wiki\/(.+)$/);
    if (!match) {
      return null;
    }
    
    const title = decodeURIComponent(match[1]);
    
    // Use Wikipedia REST API to get page summary with image
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    
    // Fetch with extended timeout for better reliability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(apiUrl, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Prefer thumbnail for faster loading (smaller file size)
    let imageUrl: string | null = null;
    if (data.thumbnail?.source) {
      // Use higher resolution thumbnail (400px) for better quality
      const thumbnailUrl = data.thumbnail.source;
      // Replace the size parameter in the URL to get 400px version
      imageUrl = thumbnailUrl.replace(/\/\d+px-/, '/400px-');
    } else if (data.originalimage?.source) {
      imageUrl = data.originalimage.source;
    }
    
    // Only cache successful image fetches
    if (imageUrl) {
      setCachedImage(wikiUrl, imageUrl);
    }
    
    return imageUrl;
  } catch (error) {
    // Silent fail for aborted requests (timeout)
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error fetching Wikipedia image:', error);
    }
    return null;
  }
};
