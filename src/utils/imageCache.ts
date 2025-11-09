// In-memory cache for Wikipedia images
interface CacheEntry {
  url: string | null;
  timestamp: number;
}

const imageCache = new Map<string, CacheEntry>();

// Cache successful images permanently, but retry failed attempts after 5 minutes
const FAILED_RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const getCachedImage = (wikiUrl: string): string | null | undefined => {
  const cached = imageCache.get(wikiUrl);
  
  if (!cached) {
    return undefined; // Not in cache
  }
  
  // If it's a successful image (not null), return it
  if (cached.url !== null) {
    return cached.url;
  }
  
  // If it's a failed attempt (null), check if enough time has passed to retry
  const now = Date.now();
  const timeSinceCache = now - cached.timestamp;
  
  if (timeSinceCache > FAILED_RETRY_INTERVAL) {
    // Enough time has passed, allow retry by returning undefined
    imageCache.delete(wikiUrl);
    return undefined;
  }
  
  // Still within retry interval, return null
  return null;
};

export const setCachedImage = (wikiUrl: string, imageUrl: string | null): void => {
  imageCache.set(wikiUrl, {
    url: imageUrl,
    timestamp: Date.now()
  });
};
