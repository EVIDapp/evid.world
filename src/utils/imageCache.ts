// Persistent cache with localStorage backup (only for successful results)
const imageCache = new Map<string, string>();

// Clear negative cache on load
const clearNegativeCache = () => {
  try {
    localStorage.removeItem('wikiImageCache');
  } catch (e) {
    console.error('Failed to clear cache:', e);
  }
};

// Load cache from localStorage on init
const loadCacheFromStorage = () => {
  try {
    const stored = localStorage.getItem('wikiImageCache');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only load non-empty values
      Object.entries(parsed).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim()) {
          imageCache.set(key, value as string);
        }
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

// Clear negative cache and initialize
clearNegativeCache();
loadCacheFromStorage();

export const getCachedImage = (wikiUrl: string): string | undefined => {
  return imageCache.get(wikiUrl);
};

export const setCachedImage = (wikiUrl: string, imageUrl: string): void => {
  // Only cache non-empty successful results
  if (imageUrl && imageUrl.trim() && imageUrl.startsWith('https://upload.wikimedia.org')) {
    imageCache.set(wikiUrl, imageUrl);
    saveCacheToStorage();
  }
};

export const clearImageCache = (): void => {
  imageCache.clear();
  localStorage.removeItem('wikiImageCache');
};
