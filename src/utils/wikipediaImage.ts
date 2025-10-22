import { getCachedImage, setCachedImage } from './imageCache';

export const getWikipediaImage = async (wikiUrl: string): Promise<string | null> => {
  // Check cache first
  const cached = getCachedImage(wikiUrl);
  if (cached !== undefined) {
    return cached;
  }
  
  try {
    // Extract article title from Wikipedia URL
    const match = wikiUrl.match(/\/wiki\/(.+)$/);
    if (!match) {
      setCachedImage(wikiUrl, null);
      return null;
    }
    
    const title = decodeURIComponent(match[1]);
    
    // Use Wikipedia REST API to get page summary with image
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      setCachedImage(wikiUrl, null);
      return null;
    }
    
    const data = await response.json();
    
    // Return the original image URL (not thumbnail)
    let imageUrl: string | null = null;
    if (data.originalimage?.source) {
      imageUrl = data.originalimage.source;
    } else if (data.thumbnail?.source) {
      imageUrl = data.thumbnail.source;
    }
    
    // Cache the result
    setCachedImage(wikiUrl, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error);
    setCachedImage(wikiUrl, null);
    return null;
  }
};
