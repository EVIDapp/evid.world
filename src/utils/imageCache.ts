// In-memory cache for Wikipedia images
const imageCache = new Map<string, string | null>();
const failedAttemptsCache = new Map<string, number>();
const FAILED_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes retry timeout

export const getCachedImage = (wikiUrl: string): string | null | undefined => {
  // Check if this was a recent failed attempt
  const failedTime = failedAttemptsCache.get(wikiUrl);
  if (failedTime && Date.now() - failedTime < FAILED_CACHE_DURATION) {
    return undefined; // Return undefined to skip cache and allow retry after timeout
  }
  
  // If failed cache expired, remove it
  if (failedTime) {
    failedAttemptsCache.delete(wikiUrl);
  }
  
  return imageCache.get(wikiUrl);
};

export const setCachedImage = (wikiUrl: string, imageUrl: string | null): void => {
  if (imageUrl) {
    imageCache.set(wikiUrl, imageUrl);
    // Clear from failed attempts if successful
    failedAttemptsCache.delete(wikiUrl);
  } else {
    // Mark as failed attempt with timestamp
    failedAttemptsCache.set(wikiUrl, Date.now());
  }
};

export const clearImageCache = (): void => {
  imageCache.clear();
  failedAttemptsCache.clear();
};
