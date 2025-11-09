// In-memory cache for Wikipedia images - NEVER cache failed attempts permanently
const imageCache = new Map<string, string>();

export const getCachedImage = (wikiUrl: string): string | undefined => {
  return imageCache.get(wikiUrl);
};

export const setCachedImage = (wikiUrl: string, imageUrl: string): void => {
  imageCache.set(wikiUrl, imageUrl);
};

export const clearImageCache = (): void => {
  imageCache.clear();
};
