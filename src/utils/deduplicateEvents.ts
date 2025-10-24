import { HistoricalEvent } from '@/types/event';

export const deduplicateEvents = (events: HistoricalEvent[]): HistoricalEvent[] => {
  // IDs to remove (all duplicates - keep only ONE best version of each event)
  const idsToRemove = new Set([
    // Remove _point versions when _area exists
    'tunguska_event_1908_point',
    'san_francisco_earthquake_1906_point', 
    'alaska_earthquake_1964_point',
    'beslan_school_siege_2004_point',
    'austerlitz_battle_1805_point',
    'gaugamela_battle_331bc_point',
    'chelyabinsk_meteor_2013_point',
    
    // Mount Vesuvius duplicates - keep eruption_vesuvius_79 (radiusKm 50)
    'pompeii_eruption_79ad',
    'pompeii_eruption_79',
    
    // Titanic duplicates - keep only titanic_sinking_1912
    'titanic_shipwreck_1912',
    'titanic_shipwreck_1912_chatgpt_v2',
    
    // Korean War duplicates - keep korean_war_1950_1953
    'korean_war_1950_1953_new',
    
    // Dead Sea Scrolls duplicates - keep dead_sea_scrolls_1947
    'dead_sea_scrolls_qumran_chatgpt',
    
    // Chernobyl duplicates - keep newest chernobyl_disaster_1986 with radiusKm 30
    'chernobyl_disaster_1986_new',
    'chernobyl_reactor_accident_1986',
    'chernobyl_disaster_1986_chatgpt_v2',
    
    // Fukushima duplicates - keep newest fukushima_disaster_2011 with radiusKm 20
    'fukushima_nuclear_disaster_2011_v2',
    
    // Iranian Embassy Siege duplicates
    'iranian_embassy_siege_1980',
    
    // Algerian War duplicates
    'algerian_war_1954_1962_new',
    
    // Iran-Iraq War duplicates  
    'iran_iraq_war_1980_1988_new',
    
    // Terracotta Army duplicates - keep terracotta_army_1974
    'terracotta_army_discovery',
    
    // Mount Vesuvius duplicates - keep eruption_vesuvius_79
    'pompeii_eruption_79ad',
    'pompeii_eruption_79',
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

