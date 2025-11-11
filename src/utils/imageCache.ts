// In-memory cache for Wikipedia images
const imageCache = new Map<string, string | null>();

export const getCachedImage = (wikiUrl: string): string | null | undefined => {
  return imageCache.get(wikiUrl);
};

export const setCachedImage = (wikiUrl: string, imageUrl: string | null): void => {
  imageCache.set(wikiUrl, imageUrl);
};
