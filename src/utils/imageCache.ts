// Persistent cache with localStorage backup
const imageCache = new Map<string, string>();

// Load cache from localStorage on init
const loadCacheFromStorage = () => {
  try {
    const stored = localStorage.getItem('wikiImageCache');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        imageCache.set(key, value as string);
      });
    }
  } catch (e) {
    console.error('Failed to load image cache:', e);
  }
};

// Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    const cacheObj: Record<string, string> = {};
    imageCache.forEach((value, key) => {
      cacheObj[key] = value;
    });
    localStorage.setItem('wikiImageCache', JSON.stringify(cacheObj));
  } catch (e) {
    console.error('Failed to save image cache:', e);
  }
};

// Initialize cache on load
loadCacheFromStorage();

export const getCachedImage = (wikiUrl: string): string | undefined => {
  return imageCache.get(wikiUrl);
};

export const setCachedImage = (wikiUrl: string, imageUrl: string): void => {
  imageCache.set(wikiUrl, imageUrl);
  saveCacheToStorage();
};

export const clearImageCache = (): void => {
  imageCache.clear();
  localStorage.removeItem('wikiImageCache');
};
