import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`Total events before cleanup: ${events.length}`);

// Known casualties data
const knownCasualties = {
  // World Wars
  'world_war_1_global_1914_1918': 17000000,
  'world_war_1_begins_1914': 17000000,
  'world_war_2_global_1939_1945': 75000000,
  
  // Major Wars
  'vietnam_war_1955_1975': 3000000,
  'korean_war_1950_1953': 3000000,
  'iran_iraq_war_1980_1988': 1000000,
  'iran_iraq_war_1980_1988_new': 1000000,
  'gulf_war_1990_1991': 50000,
  'gulf_war_1990_1991_new': 50000,
  'soviet_afghan_war_1979_1989': 1500000,
  'russo_japanese_war_1904_1905': 130000,
  'russo_japanese_war_1904_1905_new': 130000,
  'yom_kippur_war_1973': 20000,
  'yom_kippur_war_1973_new': 20000,
  'six_day_war_1967': 20000,
  'six_day_war_1967_new': 20000,
  'balkan_wars_1912_1913': 200000,
  'greco_turkish_war_1919_1922': 200000,
  'italo_ethiopian_war_1935_1936': 500000,
  'spanish_civil_war_1936_1939': 500000,
  'bosnian_war_1992_1995': 100000,
  'bosnian_war_1992_1995_new': 100000,
  'kosovo_war_1998_1999': 13000,
  'kosovo_war_1998_1999_new': 13000,
  'first_indochina_war_1946_1954': 400000,
  'first_indochina_war_1946_1954_new': 400000,
  'algerian_war_1954_1962': 300000,
  'algerian_war_1954_1962_new': 300000,
  'syrian_civil_war_2011_present': 500000,
  'syrian_civil_war_2011_present_new': 500000,
  'nagorno_karabakh_war_2020': 7000,
  'nagorno_karabakh_war_2020_new': 7000,
  'invasion_of_poland_1939': 200000,
  'battle_of_britain_1940': 45000,
  'pearl_harbor_1941': 2400,
  'battle_of_stalingrad_1942': 2000000,
  'battle_of_kursk_1943': 800000,
  'normandy_landings_1944': 425000,
  'hiroshima_atomic_bombing_1945': 140000,
  'nagasaki_atomic_bombing_1945': 74000,
  
  // Terror Attacks
  'september_11_attacks_2001': 2977,
  'oklahoma_city_bombing_1995': 168,
  'oklahoma_city_bombing_1995_new': 168,
  'madrid_train_bombings_2004': 191,
  'madrid_train_bombings_2004_new': 191,
  'beslan_school_siege_2004': 334,
  'beslan_school_siege_2004_new': 334,
  'mumbai_attacks_2008': 175,
  'mumbai_attacks_2008_new': 175,
  'paris_attacks_2015': 130,
  'paris_attacks_2015_new': 130,
  'brussels_bombings_2016': 32,
  'brussels_bombings_2016_new': 32,
  
  // Disasters
  'chernobyl_disaster_1986': 31,
  'chernobyl_disaster_1986_new': 31,
  'chernobyl_disaster_1986_chatgpt_v2': 31,
  'bhopal_disaster_1984': 3787,
  'bhopal_disaster_1984_chatgpt': 3787,
  'titanic_shipwreck_1912': 1517,
  'titanic_shipwreck_1912_chatgpt_v2': 1517,
  'titanic_sinking_1912': 1517,
  'hindenburg_disaster_1937': 36,
  'deepwater_horizon_spill_2010': 11,
  'deepwater_horizon_oil_spill_chatgpt_v2': 11,
  'three_mile_island_1979_chatgpt': 0,
  'exxon_valdez_1989_chatgpt': 0,
  'piper_alpha_1988_chatgpt': 167,
  'texas_city_disaster_1947_chatgpt': 581,
  'seveso_disaster_1976_chatgpt': 0,
  'banqiao_dam_failure_1975_chatgpt': 171000,
  'kyshtym_disaster_1957_chatgpt': 200,
  'sayano_shushenskaya_accident_2009_chatgpt': 75,
  'aberfan_disaster_1966_chatgpt': 144,
  'rana_plaza_collapse_2013_chatgpt': 1134,
  'sampoong_store_collapse_1995_chatgpt': 502,
  'beirut_port_explosion_2020_chatgpt': 218,
  'halifax_explosion_1917_chatgpt': 2000,
  'halabja_chemical_attack_1988_chatgpt': 5000,
  
  // Earthquakes
  'turkey_syria_earthquake_2023': 59000,
  'haiti_earthquake_2010': 316000,
  'kashmir_earthquake_2005_chatgpt': 87000,
  'kobe_earthquake_1995_chatgpt': 6434,
  
  // Tsunamis
  'chile_1960_tsunami_chatgpt': 5700,
  'alaska_1964_tsunami_chatgpt': 139,
  'krakatoa_1883_tsunami_chatgpt': 36000,
  'cascadia_1700_tsunami_chatgpt': 0,
  'sulawesi_2018_palu_tsunami_chatgpt': 4340,
  'samoa_2009_tsunami_chatgpt': 189,
};

// Normalize title for comparison - more aggressive
const normalizeTitle = (title) => {
  return title
    .replace(/\([\d–-\s]+\)/g, '') // Remove years in parentheses
    .replace(/\(ChatGPT version\)/gi, '')
    .replace(/\(ChatGPT\)/gi, '')
    .replace(/\s+version\s*/gi, '')
    .replace(/\s*\d{4}[-–]\d{4}\s*/g, '') // Remove year ranges
    .replace(/\s*\d{1,4}\s+(CE|BCE|BC|AD)\s*/gi, '') // Remove years with era
    .replace(/[\d]+/g, '') // Remove all numbers
    .replace(/[–—―−-]+/g, '') // Remove all dashes
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

// Score event quality
const scoreEvent = (event) => {
  let score = 0;
  
  // Prefer _area suffix
  if (event.id.includes('_area')) score += 1000;
  
  // Penalize bad suffixes
  if (event.id.includes('_chatgpt')) score -= 500;
  if (event.id.includes('_v2')) score -= 300;
  if (event.id.includes('_point')) score -= 200;
  if (event.id.includes('_new')) score -= 100;
  
  // Bonus for good data
  if (event.radiusKm) score += 100;
  if (event.casualties && event.casualties > 0) score += 50;
  if (event.desc_long) score += event.desc_long.length;
  if (event.desc) score += event.desc.length * 0.5;
  if (event.image) score += 20;
  if (event.wiki) score += 10;
  
  return score;
};

// Track seen titles and find duplicates
const seenTitles = new Map();
const idsToRemove = new Set();

events.forEach((event, index) => {
  const normalized = normalizeTitle(event.title);
  
  if (seenTitles.has(normalized)) {
    const firstIndex = seenTitles.get(normalized);
    const firstEvent = events[firstIndex];
    
    const currentScore = scoreEvent(event);
    const firstScore = scoreEvent(firstEvent);
    
    if (currentScore > firstScore) {
      idsToRemove.add(firstEvent.id);
      seenTitles.set(normalized, index);
      console.log(`Duplicate found: "${event.title}"`);
      console.log(`  Keeping: ${event.id} (score: ${currentScore})`);
      console.log(`  Removing: ${firstEvent.id} (score: ${firstScore})`);
    } else {
      idsToRemove.add(event.id);
      console.log(`Duplicate found: "${event.title}"`);
      console.log(`  Keeping: ${firstEvent.id} (score: ${firstScore})`);
      console.log(`  Removing: ${event.id} (score: ${currentScore})`);
    }
  } else {
    seenTitles.set(normalized, index);
  }
});

// Year ranges for events (id -> year range string)
const yearRanges = {
  'world_war_1_global_1914_1918': '1914-1918',
  'world_war_1_begins_1914': '1914-1918',
  'world_war_2_global_1939_1945': '1939-1945',
  'vietnam_war_1955_1975': '1955-1975',
  'korean_war_1950_1953': '1950-1953',
  'iran_iraq_war_1980_1988': '1980-1988',
  'iran_iraq_war_1980_1988_new': '1980-1988',
  'gulf_war_1990_1991': '1990-1991',
  'gulf_war_1990_1991_new': '1990-1991',
  'soviet_afghan_war_1979_1989': '1979-1989',
  'russo_japanese_war_1904_1905': '1904-1905',
  'russo_japanese_war_1904_1905_new': '1904-1905',
  'bosnian_war_1992_1995': '1992-1995',
  'bosnian_war_1992_1995_new': '1992-1995',
  'kosovo_war_1998_1999': '1998-1999',
  'kosovo_war_1998_1999_new': '1998-1999',
  'first_indochina_war_1946_1954': '1946-1954',
  'first_indochina_war_1946_1954_new': '1946-1954',
  'algerian_war_1954_1962': '1954-1962',
  'algerian_war_1954_1962_new': '1954-1962',
  'syrian_civil_war_2011_present': '2011-present',
  'syrian_civil_war_2011_present_new': '2011-present',
  'spanish_civil_war_1936_1939': '1936-1939',
  'balkan_wars_1912_1913': '1912-1913',
  'greco_turkish_war_1919_1922': '1919-1922',
  'italo_ethiopian_war_1935_1936': '1935-1936',
};

// Remove duplicates and add casualties
const uniqueEvents = events
  .filter(event => !idsToRemove.has(event.id))
  .map(event => {
    // Add casualties if known and missing
    if (knownCasualties[event.id] !== undefined) {
      const knownValue = knownCasualties[event.id];
      if (event.casualties === null || event.casualties === undefined || event.casualties === 0) {
        console.log(`Adding casualties to ${event.id}: ${knownValue}`);
        event.casualties = knownValue;
      }
    }
    
    // Fix year ranges for wars
    if (yearRanges[event.id] !== undefined) {
      const correctYear = yearRanges[event.id];
      if (event.year !== correctYear) {
        console.log(`Fixing year for ${event.id}: ${event.year} -> ${correctYear}`);
        event.year = correctYear;
      }
    }
    
    return event;
  });

console.log(`\nTotal events after cleanup: ${uniqueEvents.length}`);
console.log(`Removed ${events.length - uniqueEvents.length} duplicates`);

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(uniqueEvents, null, 2));
console.log(`\n✅ Updated ${eventsPath}`);
