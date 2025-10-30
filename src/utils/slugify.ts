export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

export const generateEventSlug = (title: string, year?: string): string => {
  if (!year) {
    return slugify(title);
  }

  // Remove -ongoing suffix if present
  let processedYear = year.replace(/-ongoing$/i, '').trim();
  
  // Check if title starts with year pattern (e.g., "1964 Alaska Earthquake")
  const yearAtStartPattern = /^(\d{1,4}(?:-\d{1,4})?(?:\s*bc)?)\s+(.+)$/i;
  const yearMatch = title.match(yearAtStartPattern);
  
  let cleanTitle = title;
  let finalYear = processedYear;
  
  if (yearMatch) {
    // Move year from start to end
    cleanTitle = yearMatch[2];
    finalYear = processedYear; // Keep the year from event data
  }
  
  // Process BC years: ensure only one -bc suffix
  if (processedYear.toLowerCase().includes('bc')) {
    // Remove all BC mentions first
    finalYear = processedYear.replace(/\s*bc/gi, '').trim();
    // Add single -bc at the end
    finalYear = `${finalYear}-bc`;
  }
  
  // Clean up the year string: remove duplicate dashes
  finalYear = finalYear.replace(/--+/g, '-');
  
  const titleSlug = slugify(cleanTitle);
  
  // Ensure no duplicate year in slug
  const yearPattern = finalYear.replace(/-/g, '\\-');
  const duplicatePattern = new RegExp(`-${yearPattern}$`);
  
  if (titleSlug.match(duplicatePattern)) {
    return titleSlug; // Year already in title slug
  }
  
  return `${titleSlug}-${finalYear}`;
};
