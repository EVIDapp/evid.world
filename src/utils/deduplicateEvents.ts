import { HistoricalEvent } from '@/types/event';

export const deduplicateEvents = (events: HistoricalEvent[]): HistoricalEvent[] => {
  // IDs to remove (duplicates identified) - explicitly remove only _point when _area exists
  const idsToRemove = new Set([
    'tunguska_event_1908_point',
    'san_francisco_earthquake_1906_point', 
    'alaska_earthquake_1964_point',
    'beslan_school_siege_2004_point',
    'austerlitz_battle_1805_point',
    'gaugamela_battle_331bc_point',
    'chelyabinsk_meteor_2013_point', // Remove point, keep area version
  ]);

  // Track seen event titles (normalized)
  const seenTitles = new Map<string, number>();
  const uniqueEvents: HistoricalEvent[] = [];

  const normalizeTitle = (title: string): string => {
    return title
      .replace(/\([\d–-\s]+\)/g, '') // Remove date ranges
      .replace(/[\d]+/g, '') // Remove standalone numbers
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  };

  events.forEach((event) => {
    // Skip if in removal list
    if (idsToRemove.has(event.id)) {
      return;
    }

    const normalizedTitle = normalizeTitle(event.title);
    
    if (seenTitles.has(normalizedTitle)) {
      const existingIndex = seenTitles.get(normalizedTitle)!;
      const existingEvent = uniqueEvents[existingIndex];
      
      // Prefer events with _area suffix or better descriptions
      const currentScore = 
        (event.id.includes('_area') ? 100 : 0) +
        (event.radiusKm ? 50 : 0) +
        (event.desc_long?.length || 0);
      
      const existingScore = 
        (existingEvent.id.includes('_area') ? 100 : 0) +
        (existingEvent.radiusKm ? 50 : 0) +
        (existingEvent.desc_long?.length || 0);
      
      if (currentScore > existingScore) {
        uniqueEvents[existingIndex] = event;
      }
    } else {
      seenTitles.set(normalizedTitle, uniqueEvents.length);
      uniqueEvents.push(event);
    }
  });

  console.log(`Deduplication: ${events.length} -> ${uniqueEvents.length} events`);
  
  return uniqueEvents;
};

