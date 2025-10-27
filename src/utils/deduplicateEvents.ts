import { HistoricalEvent } from '@/types/event';

export const deduplicateEvents = (events: HistoricalEvent[]): HistoricalEvent[] => {
  // IDs to remove (all duplicates - keep only ONE best version of each event)
  const idsToRemove = new Set([
    // Remove _point versions
    'tunguska_event_1908_point',
    'san_francisco_earthquake_1906_point', 
    'alaska_earthquake_1964_point',
    'beslan_school_siege_2004_point',
    'austerlitz_battle_1805_point',
    'gaugamela_battle_331bc_point',
    'chelyabinsk_meteor_2013_point',
    
    // Remove _new versions
    'russo_japanese_war_1904_1905_new',
    'korean_war_1950_1953_new',
    'algerian_war_1954_1962_new',
    'yom_kippur_war_1973_new',
    'syrian_civil_war_2011_present_new',
    'iran_iraq_war_1980_1988_new',
    'gulf_war_1990_1991_new',
    'six_day_war_1967_new',
    'first_indochina_war_1946_1954_new',
    'bosnian_war_1992_1995_new',
    'kosovo_war_1998_1999_new',
    'nagorno_karabakh_war_2020_new',
    'oklahoma_city_bombing_1995_new',
    'madrid_train_bombings_2004_new',
    'beslan_school_siege_2004_new',
    'mumbai_attacks_2008_new',
    'paris_attacks_2015_new',
    'brussels_bombings_2016_new',
    'chernobyl_disaster_1986_new',
    'deepwater_horizon_spill_2010_new',
    
    // Remove _chatgpt and _chatgpt_v2 versions
    'chile_1960_tsunami_chatgpt',
    'alaska_1964_tsunami_chatgpt',
    'krakatoa_1883_tsunami_chatgpt',
    'cascadia_1700_tsunami_chatgpt',
    'sulawesi_2018_palu_tsunami_chatgpt',
    'samoa_2009_tsunami_chatgpt',
    'kobe_earthquake_1995_chatgpt',
    'kashmir_earthquake_2005_chatgpt',
    'beirut_port_explosion_2020_chatgpt',
    'halifax_explosion_1917_chatgpt',
    'three_mile_island_1979_chatgpt',
    'exxon_valdez_1989_chatgpt',
    'piper_alpha_1988_chatgpt',
    'texas_city_disaster_1947_chatgpt',
    'seveso_disaster_1976_chatgpt',
    'banqiao_dam_failure_1975_chatgpt',
    'kyshtym_disaster_1957_chatgpt',
    'sayano_shushenskaya_accident_2009_chatgpt',
    'aberfan_disaster_1966_chatgpt',
    'rana_plaza_collapse_2013_chatgpt',
    'sampoong_store_collapse_1995_chatgpt',
    'love_canal_1978_chatgpt',
    'bhopal_disaster_1984_chatgpt',
    'halabja_chemical_attack_1988_chatgpt',
    'chernobyl_disaster_1986_chatgpt_v2',
    'deepwater_horizon_oil_spill_chatgpt_v2',
    'titanic_shipwreck_1912_chatgpt_v2',
    'dead_sea_scrolls_qumran_chatgpt',
    'altamira_cave_art_chatgpt',
    'lascaux_cave_art_chatgpt',
    'chauvet_cave_art_chatgpt',
    'sutton_hoo_ship_burial_chatgpt',
    'machu_picchu_site_chatgpt',
    'olduvai_gorge_leakey_chatgpt',
    'laetoli_footprints_chatgpt',
    'otzi_iceman_findspot_chatgpt',
    'angkor_wat_complex_chatgpt',
    'troy_hisarlik_chatgpt',
    'great_zimbabwe_ruins_chatgpt',
    'mohenjo_daro_site_chatgpt',
    'petra_site_chatgpt',
    'nazca_lines_chatgpt',
    'stonehenge_site_chatgpt',
    'nabta_playa_site_chatgpt',
    'denisova_cave_chatgpt',
    'ur_royal_tombs_chatgpt',
    'blackwater_draw_clovis_chatgpt',
    'skara_brae_chatgpt',
    'jericho_tell_es_sultan_chatgpt',
    'catalhoyuk_site_chatgpt',
    'sanxingdui_site_chatgpt',
    'dmanisi_hominins_chatgpt',
    'giza_pyramids_chatgpt',
    'teotihuacan_site_chatgpt',
    'easter_island_moai_chatgpt',
    'palmyra_site_chatgpt',
    
    // Old specific duplicates
    'pompeii_eruption_79ad',
    'pompeii_eruption_79',
    'titanic_shipwreck_1912',
    'chernobyl_reactor_accident_1986',
    'fukushima_nuclear_disaster_2011_v2',
    'iranian_embassy_siege_1980',
    'terracotta_army_discovery',
    
    // Rosetta Stone duplicates (keep best one)
    'rosetta_stone_discovery_1799',
    'rosetta_stone_1799',
  ]);

  // Track seen event titles (normalized)
  const seenTitles = new Map<string, number>();
  const uniqueEvents: HistoricalEvent[] = [];

  const normalizeTitle = (title: string): string => {
    return title
      .replace(/\([\d–-\s]+\)/g, '') // Remove date ranges like (1799) or (1950-1953)
      .replace(/[\d]+/g, '') // Remove all numbers
      .replace(/CE|AD|BC/gi, '') // Remove era markers
      .replace(/discovery|discovered|findspot|site|found|excavation/gi, '') // Remove archaeological terms
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/[^\w\s]/g, ''); // Remove punctuation
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
      
      // Score events (higher = better)
      const currentScore = 
        (event.id.includes('_area') ? 1000 : 0) +
        (event.radiusKm ? 500 : 0) +
        (event.desc_long?.length || 0) +
        (event.desc?.length || 0) * 0.5 +
        (event.year ? 100 : 0) +
        (event.casualties ? 100 : 0) +
        (event.image ? 200 : 0) -
        (event.id.includes('_new') ? 800 : 0) -
        (event.id.includes('_point') ? 900 : 0) -
        (event.id.includes('_chatgpt') ? 900 : 0) -
        (event.id.includes('_v2') ? 850 : 0);
      
      const existingScore = 
        (existingEvent.id.includes('_area') ? 1000 : 0) +
        (existingEvent.radiusKm ? 500 : 0) +
        (existingEvent.desc_long?.length || 0) +
        (existingEvent.desc?.length || 0) * 0.5 +
        (existingEvent.year ? 100 : 0) +
        (existingEvent.casualties ? 100 : 0) +
        (existingEvent.image ? 200 : 0) -
        (existingEvent.id.includes('_new') ? 800 : 0) -
        (existingEvent.id.includes('_point') ? 900 : 0) -
        (existingEvent.id.includes('_chatgpt') ? 900 : 0) -
        (existingEvent.id.includes('_v2') ? 850 : 0);
      
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

