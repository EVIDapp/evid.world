import { HistoricalEvent } from '@/types/event';

export const deduplicateEvents = (events: HistoricalEvent[]): HistoricalEvent[] => {
  // IDs to remove (duplicates identified)
  const idsToRemove = new Set([
    // Remove _point versions (keep _area or base versions)
    'chelyabinsk_meteor_2013_point',
    'tunguska_event_1908_point',
    'san_francisco_earthquake_1906_point',
    'alaska_earthquake_1964_point',
    'beslan_school_siege_2004_point',
    'austerlitz_battle_1805_point',
    'gaugamela_battle_331bc_point',
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
      console.log('Removing duplicate:', event.id, event.title);
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
        console.log('Replacing duplicate:', existingEvent.id, 'with', event.id);
        uniqueEvents[existingIndex] = event;
      } else {
        console.log('Skipping duplicate:', event.id, '(keeping', existingEvent.id, ')');
      }
    } else {
      seenTitles.set(normalizedTitle, uniqueEvents.length);
      uniqueEvents.push(event);
    }
  });

  console.log(`Deduplication: ${events.length} -> ${uniqueEvents.length} events (removed ${events.length - uniqueEvents.length})`);
  
  return uniqueEvents;
};

