export const getWikipediaImage = async (wikiUrl: string): Promise<string | null> => {
  try {
    // Extract article title from Wikipedia URL
    const match = wikiUrl.match(/\/wiki\/(.+)$/);
    if (!match) return null;
    
    const title = decodeURIComponent(match[1]);
    
    // Use Wikipedia REST API to get page summary with image
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Return the original image URL (not thumbnail)
    if (data.originalimage?.source) {
      return data.originalimage.source;
    } else if (data.thumbnail?.source) {
      return data.thumbnail.source;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error);
    return null;
  }
};
