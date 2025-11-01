import { HistoricalEvent } from '@/types/event';

/**
 * Calculate geographical distance between two points (Haversine formula)
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Extract year from year string (handles ranges like "1914-1918" or "500 BC")
 */
function extractYear(yearStr: string | undefined): number {
  if (!yearStr) return 0;
  
  // Handle BC dates
  if (yearStr.toLowerCase().includes('bc')) {
    const match = yearStr.match(/(\d+)/);
    return match ? -parseInt(match[1]) : 0;
  }
  
  // Handle year ranges - take the start year
  const match = yearStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Calculate temporal similarity (0-1 scale)
 * Events from the same era are more related
 */
function getTemporalSimilarity(year1: number, year2: number): number {
  const diff = Math.abs(year1 - year2);
  
  // Events in the same year = 1.0
  if (diff === 0) return 1.0;
  
  // Same decade = 0.9
  if (diff < 10) return 0.9;
  
  // Same 50-year period = 0.7
  if (diff < 50) return 0.7;
  
  // Same century = 0.5
  if (diff < 100) return 0.5;
  
  // Same 500-year period = 0.3
  if (diff < 500) return 0.3;
  
  // Older = less related
  return Math.max(0, 1 - (diff / 2000));
}

/**
 * Calculate geographical similarity (0-1 scale)
 */
function getGeographicalSimilarity(
  event1: HistoricalEvent,
  event2: HistoricalEvent
): number {
  // Same country = high similarity
  if (event1.country === event2.country) return 0.9;
  
  // Calculate distance
  const distance = getDistance(
    event1.pos.lat,
    event1.pos.lng,
    event2.pos.lat,
    event2.pos.lng
  );
  
  // Very close (< 500 km) = 0.8
  if (distance < 500) return 0.8;
  
  // Nearby (< 2000 km) = 0.6
  if (distance < 2000) return 0.6;
  
  // Same continent approximately (< 5000 km) = 0.3
  if (distance < 5000) return 0.3;
  
  // Different continents
  return 0.1;
}

/**
 * Calculate scale similarity based on casualties and radius
 */
function getScaleSimilarity(event1: HistoricalEvent, event2: HistoricalEvent): number {
  let similarity = 0;
  let factors = 0;
  
  // Compare casualties if both have them
  if (event1.casualties && event2.casualties) {
    factors++;
    const casualtyRatio = Math.min(event1.casualties, event2.casualties) / 
                          Math.max(event1.casualties, event2.casualties);
    similarity += casualtyRatio;
  }
  
  // Compare radius if both have them
  if (event1.radiusKm && event2.radiusKm) {
    factors++;
    const radiusRatio = Math.min(event1.radiusKm, event2.radiusKm) / 
                        Math.max(event1.radiusKm, event2.radiusKm);
    similarity += radiusRatio;
  }
  
  return factors > 0 ? similarity / factors : 0.5;
}

/**
 * Calculate overall similarity score between two events
 * Returns a score from 0 to 100
 */
export function calculateSimilarity(
  sourceEvent: HistoricalEvent,
  candidateEvent: HistoricalEvent
): number {
  // Don't recommend the same event
  if (sourceEvent.id === candidateEvent.id) return 0;
  
  let score = 0;
  
  // 1. Event Type - Most Important (40 points)
  if (sourceEvent.type === candidateEvent.type) {
    score += 40;
  }
  
  // 2. Temporal Proximity (25 points)
  const year1 = extractYear(sourceEvent.year);
  const year2 = extractYear(candidateEvent.year);
  score += getTemporalSimilarity(year1, year2) * 25;
  
  // 3. Geographical Proximity (20 points)
  score += getGeographicalSimilarity(sourceEvent, candidateEvent) * 20;
  
  // 4. Scale Similarity (15 points)
  score += getScaleSimilarity(sourceEvent, candidateEvent) * 15;
  
  return score;
}

/**
 * Get smart recommendations for an event
 * Returns up to maxResults most similar events
 */
export function getSmartRecommendations(
  sourceEvent: HistoricalEvent,
  allEvents: HistoricalEvent[],
  maxResults: number = 6
): HistoricalEvent[] {
  // Calculate similarity scores for all events
  const scoredEvents = allEvents
    .map(event => ({
      event,
      score: calculateSimilarity(sourceEvent, event)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  return scoredEvents.map(item => item.event);
}
