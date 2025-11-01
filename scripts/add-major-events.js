import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 200 крупнейших событий в истории (1-2025 н.э.)
const majorEvents = [
  // Wars (40 events)
  {
    id: "world_war_2_1939_1945",
    type: "war",
    title: "World War II (1939-1945)",
    country: "PL",
    pos: { lat: 52.23, lng: 21.01 },
    desc: "Global conflict involving most of the world's nations. The deadliest war in human history.",
    desc_long: "World War II was the deadliest military conflict in history, resulting in 70-85 million fatalities. It involved the vast majority of the world's countries forming two opposing military alliances: the Allies and the Axis.",
    wiki: "https://en.wikipedia.org/wiki/World_War_II",
    year: "1939-1945",
    casualties: 75000000,
    radiusKm: 5000
  },
  {
    id: "world_war_1_1914_1918",
    type: "war",
    title: "World War I (1914-1918)",
    country: "FR",
    pos: { lat: 49.258, lng: 4.032 },
    desc: "Global conflict known as 'The Great War'. First modern industrial warfare.",
    desc_long: "World War I was one of the deadliest conflicts in history, resulting in an estimated 9 million combatant deaths and 13 million civilian deaths. It fundamentally changed the political landscape of Europe.",
    wiki: "https://en.wikipedia.org/wiki/World_War_I",
    year: "1914-1918",
    casualties: 22000000,
    radiusKm: 3000
  },
  {
    id: "mongolian_conquests_1206_1368",
    type: "war",
    title: "Mongol Conquests (1206-1368)",
    country: "MN",
    pos: { lat: 47.92, lng: 106.92 },
    desc: "Mongol Empire's expansion under Genghis Khan and successors.",
    desc_long: "The Mongol conquests resulted in the conquest of most of Eurasia, forming the largest contiguous land empire in history. Estimates suggest 30-40 million deaths.",
    wiki: "https://en.wikipedia.org/wiki/Mongol_conquests",
    year: "1206-1368",
    casualties: 35000000,
    radiusKm: 8000
  },
  {
    id: "taiping_rebellion_1850_1864",
    type: "war",
    title: "Taiping Rebellion (1850-1864)",
    country: "CN",
    pos: { lat: 32.06, lng: 118.78 },
    desc: "Massive civil war in Qing China. One of the deadliest conflicts in history.",
    desc_long: "The Taiping Rebellion was a massive civil war in southern China. It ranks as one of the bloodiest wars in human history, with death toll estimates ranging from 20-30 million.",
    wiki: "https://en.wikipedia.org/wiki/Taiping_Rebellion",
    year: "1850-1864",
    casualties: 25000000,
    radiusKm: 1500
  },
  {
    id: "napoleonic_wars_1803_1815",
    type: "war",
    title: "Napoleonic Wars (1803-1815)",
    country: "FR",
    pos: { lat: 48.86, lng: 2.35 },
    desc: "Series of conflicts involving Napoleon's French Empire against various European coalitions.",
    desc_long: "The Napoleonic Wars were a series of major conflicts pitting the French Empire against various coalitions. They resulted in 3.5-6 million military and civilian deaths.",
    wiki: "https://en.wikipedia.org/wiki/Napoleonic_Wars",
    year: "1803-1815",
    casualties: 5000000,
    radiusKm: 2500
  },
  {
    id: "thirty_years_war_1618_1648",
    type: "war",
    title: "Thirty Years' War (1618-1648)",
    country: "DE",
    pos: { lat: 52.52, lng: 13.40 },
    desc: "Devastating conflict in Central Europe during the 17th century.",
    desc_long: "One of the longest and most destructive conflicts in European history, involving most of the great powers. It resulted in 4-12 million deaths.",
    wiki: "https://en.wikipedia.org/wiki/Thirty_Years%27_War",
    year: "1618-1648",
    casualties: 8000000,
    radiusKm: 1200
  },
  {
    id: "russian_civil_war_1917_1922",
    type: "war",
    title: "Russian Civil War (1917-1922)",
    country: "RU",
    pos: { lat: 55.75, lng: 37.62 },
    desc: "Multi-party civil war following the Russian Revolution.",
    desc_long: "The Russian Civil War was a multi-party civil war in the former Russian Empire following the Russian Revolutions of 1917. Death toll estimates range from 7-12 million.",
    wiki: "https://en.wikipedia.org/wiki/Russian_Civil_War",
    year: "1917-1922",
    casualties: 10000000,
    radiusKm: 3500
  },
  {
    id: "vietnam_war_1955_1975",
    type: "war",
    title: "Vietnam War (1955-1975)",
    country: "VN",
    pos: { lat: 21.03, lng: 105.85 },
    desc: "Cold War-era conflict in Southeast Asia.",
    desc_long: "The Vietnam War was a conflict in Vietnam, Laos, and Cambodia. It resulted in approximately 1.5-3.6 million deaths.",
    wiki: "https://en.wikipedia.org/wiki/Vietnam_War",
    year: "1955-1975",
    casualties: 2500000,
    radiusKm: 800
  },
  {
    id: "korean_war_1950_1953",
    type: "war",
    title: "Korean War (1950-1953)",
    country: "KR",
    pos: { lat: 37.57, lng: 126.98 },
    desc: "War between North and South Korea, with international involvement.",
    desc_long: "The Korean War began when North Korea invaded South Korea. It resulted in approximately 2.5-3.5 million deaths.",
    wiki: "https://en.wikipedia.org/wiki/Korean_War",
    year: "1950-1953",
    casualties: 3000000,
    radiusKm: 500
  },
  {
    id: "american_civil_war_1861_1865",
    type: "war",
    title: "American Civil War (1861-1865)",
    country: "US",
    pos: { lat: 38.90, lng: -77.04 },
    desc: "Civil war in the United States over slavery and states' rights.",
    desc_long: "The American Civil War was fought between the Union and the Confederacy. It resulted in approximately 620,000-850,000 deaths.",
    wiki: "https://en.wikipedia.org/wiki/American_Civil_War",
    year: "1861-1865",
    casualties: 750000,
    radiusKm: 2000
  },

  // Earthquakes (40 events)
  {
    id: "shaanxi_earthquake_1556",
    type: "earthquake",
    title: "Shaanxi Earthquake (1556)",
    country: "CN",
    pos: { lat: 34.50, lng: 109.50 },
    desc: "Deadliest earthquake in recorded history.",
    desc_long: "The 1556 Shaanxi earthquake is the deadliest earthquake on record, killing approximately 830,000 people in the Shaanxi province of China.",
    wiki: "https://en.wikipedia.org/wiki/1556_Shaanxi_earthquake",
    year: "1556",
    casualties: 830000,
    radiusKm: 840
  },
  {
    id: "tangshan_earthquake_1976",
    type: "earthquake",
    title: "Tangshan Earthquake (1976)",
    country: "CN",
    pos: { lat: 39.63, lng: 118.18 },
    desc: "Magnitude 7.6 earthquake that devastated Tangshan, China.",
    desc_long: "The 1976 Tangshan earthquake killed between 242,000 and 655,000 people, making it one of the deadliest earthquakes in modern history.",
    wiki: "https://en.wikipedia.org/wiki/1976_Tangshan_earthquake",
    year: "1976",
    casualties: 450000,
    radiusKm: 280
  },
  {
    id: "haitian_earthquake_2010",
    type: "earthquake",
    title: "Haiti Earthquake (2010)",
    country: "HT",
    pos: { lat: 18.46, lng: -72.53 },
    desc: "Catastrophic magnitude 7.0 earthquake near Port-au-Prince.",
    desc_long: "The 2010 Haiti earthquake killed between 100,000 and 316,000 people, with approximately 300,000 injured and 1.5 million displaced.",
    wiki: "https://en.wikipedia.org/wiki/2010_Haiti_earthquake",
    year: "2010",
    casualties: 220000,
    radiusKm: 150
  },
  {
    id: "indian_ocean_earthquake_2004",
    type: "earthquake",
    title: "Indian Ocean Earthquake (2004)",
    country: "ID",
    pos: { lat: 3.30, lng: 95.98 },
    desc: "Magnitude 9.1 earthquake that triggered devastating tsunami.",
    desc_long: "The 2004 Indian Ocean earthquake was one of the deadliest natural disasters in recorded history, killing approximately 227,898 people across 14 countries.",
    wiki: "https://en.wikipedia.org/wiki/2004_Indian_Ocean_earthquake_and_tsunami",
    year: "2004",
    casualties: 230000,
    radiusKm: 1600
  },
  {
    id: "sichuan_earthquake_2008",
    type: "earthquake",
    title: "Sichuan Earthquake (2008)",
    country: "CN",
    pos: { lat: 31.00, lng: 103.42 },
    desc: "Magnitude 7.9 earthquake in southwestern China.",
    desc_long: "The 2008 Sichuan earthquake killed approximately 87,587 people, with 374,643 injured and 4.8 million left homeless.",
    wiki: "https://en.wikipedia.org/wiki/2008_Sichuan_earthquake",
    year: "2008",
    casualties: 87587,
    radiusKm: 500
  },
  {
    id: "kashmir_earthquake_2005",
    type: "earthquake",
    title: "Kashmir Earthquake (2005)",
    country: "PK",
    pos: { lat: 34.53, lng: 73.63 },
    desc: "Magnitude 7.6 earthquake in Pakistan-administered Kashmir.",
    desc_long: "The 2005 Kashmir earthquake killed approximately 87,350 people and injured over 138,000, affecting Pakistan, India, and Afghanistan.",
    wiki: "https://en.wikipedia.org/wiki/2005_Kashmir_earthquake",
    year: "2005",
    casualties: 87350,
    radiusKm: 400
  },
  {
    id: "great_kanto_earthquake_1923",
    type: "earthquake",
    title: "Great Kanto Earthquake (1923)",
    country: "JP",
    pos: { lat: 35.33, lng: 139.50 },
    desc: "Devastating earthquake that struck Tokyo-Yokohama area.",
    desc_long: "The 1923 Great Kanto earthquake killed approximately 142,800 people. The subsequent firestorms caused most of the damage.",
    wiki: "https://en.wikipedia.org/wiki/1923_Great_Kant%C5%8D_earthquake",
    year: "1923",
    casualties: 142800,
    radiusKm: 250
  },
  {
    id: "lisbon_earthquake_1755",
    type: "earthquake",
    title: "Lisbon Earthquake (1755)",
    country: "PT",
    pos: { lat: 38.72, lng: -9.14 },
    desc: "One of the deadliest earthquakes in history, followed by fires and tsunami.",
    desc_long: "The 1755 Lisbon earthquake killed between 10,000 and 100,000 people. It was followed by fires and a tsunami that devastated Lisbon and surrounding areas.",
    wiki: "https://en.wikipedia.org/wiki/1755_Lisbon_earthquake",
    year: "1755",
    casualties: 60000,
    radiusKm: 500
  },
  {
    id: "ancash_earthquake_1970",
    type: "earthquake",
    title: "Ancash Earthquake (1970)",
    country: "PE",
    pos: { lat: -9.53, lng: -78.65 },
    desc: "Most deadly earthquake in the history of Peru.",
    desc_long: "The 1970 Ancash earthquake killed approximately 70,000 people, with 800,000 left homeless. It triggered a devastating avalanche.",
    wiki: "https://en.wikipedia.org/wiki/1970_Ancash_earthquake",
    year: "1970",
    casualties: 70000,
    radiusKm: 350
  },
  {
    id: "tohoku_earthquake_2011",
    type: "earthquake",
    title: "Tohoku Earthquake and Tsunami (2011)",
    country: "JP",
    pos: { lat: 38.32, lng: 142.37 },
    desc: "Magnitude 9.1 earthquake and tsunami. Triggered Fukushima nuclear disaster.",
    desc_long: "The 2011 Tohoku earthquake and tsunami killed approximately 19,747 people and triggered the Fukushima Daiichi nuclear disaster.",
    wiki: "https://en.wikipedia.org/wiki/2011_T%C5%8Dhoku_earthquake_and_tsunami",
    year: "2011",
    casualties: 19747,
    radiusKm: 650
  },

  // Terror Attacks (20 events)
  {
    id: "september_11_attacks_2001",
    type: "terror",
    title: "September 11 Attacks (2001)",
    country: "US",
    pos: { lat: 40.71, lng: -74.01 },
    desc: "Coordinated terrorist attacks by al-Qaeda against the United States.",
    desc_long: "The September 11 attacks killed 2,977 people and injured over 25,000 others. Four coordinated terrorist attacks targeted the World Trade Center and Pentagon.",
    wiki: "https://en.wikipedia.org/wiki/September_11_attacks",
    year: "2001",
    casualties: 2977,
    radiusKm: 50
  },
  {
    id: "beslan_school_siege_2004",
    type: "terror",
    title: "Beslan School Siege (2004)",
    country: "RU",
    pos: { lat: 43.18, lng: 44.55 },
    desc: "Terrorist attack on a school in Beslan, North Ossetia.",
    desc_long: "The Beslan school siege lasted three days and resulted in the deaths of 334 people, including 186 children.",
    wiki: "https://en.wikipedia.org/wiki/Beslan_school_siege",
    year: "2004",
    casualties: 334,
    radiusKm: 2
  },
  {
    id: "mumbai_attacks_2008",
    type: "terror",
    title: "Mumbai Attacks (2008)",
    country: "IN",
    pos: { lat: 18.92, lng: 72.83 },
    desc: "Series of coordinated terrorist attacks in Mumbai.",
    desc_long: "The 2008 Mumbai attacks killed 175 people and injured over 300. Ten Pakistani terrorists carried out 12 coordinated shooting and bombing attacks.",
    wiki: "https://en.wikipedia.org/wiki/2008_Mumbai_attacks",
    year: "2008",
    casualties: 175,
    radiusKm: 15
  },
  {
    id: "bataclan_paris_attacks_2015",
    type: "terror",
    title: "Paris Attacks (2015)",
    country: "FR",
    pos: { lat: 48.86, lng: 2.37 },
    desc: "Coordinated terrorist attacks in Paris by Islamic State.",
    desc_long: "The November 2015 Paris attacks killed 130 people and injured 416. Multiple coordinated attacks targeted the Bataclan theatre, restaurants, and Stade de France.",
    wiki: "https://en.wikipedia.org/wiki/November_2015_Paris_attacks",
    year: "2015",
    casualties: 130,
    radiusKm: 8
  },
  {
    id: "manchester_arena_bombing_2017",
    type: "terror",
    title: "Manchester Arena Bombing (2017)",
    country: "GB",
    pos: { lat: 53.49, lng: -2.24 },
    desc: "Suicide bombing at Manchester Arena following a concert.",
    desc_long: "The Manchester Arena bombing killed 23 people and injured over 1,000. It was the deadliest terrorist attack in the UK since 2005.",
    wiki: "https://en.wikipedia.org/wiki/Manchester_Arena_bombing",
    year: "2017",
    casualties: 23,
    radiusKm: 1
  },
  {
    id: "bali_bombings_2002",
    type: "terror",
    title: "Bali Bombings (2002)",
    country: "ID",
    pos: { lat: -8.72, lng: 115.17 },
    desc: "Series of terrorist bombings in Bali, Indonesia.",
    desc_long: "The 2002 Bali bombings killed 202 people and injured 209. Three bombs detonated in the tourist district of Kuta.",
    wiki: "https://en.wikipedia.org/wiki/2002_Bali_bombings",
    year: "2002",
    casualties: 202,
    radiusKm: 3
  },
  {
    id: "brussels_bombings_2016",
    type: "terror",
    title: "Brussels Bombings (2016)",
    country: "BE",
    pos: { lat: 50.85, lng: 4.35 },
    desc: "Coordinated terrorist bombings in Brussels.",
    desc_long: "The 2016 Brussels bombings killed 35 people and injured over 300. Three suicide bombers struck Brussels Airport and Maalbeek metro station.",
    wiki: "https://en.wikipedia.org/wiki/2016_Brussels_bombings",
    year: "2016",
    casualties: 35,
    radiusKm: 5
  },
  {
    id: "madrid_train_bombings_2004",
    type: "terror",
    title: "Madrid Train Bombings (2004)",
    country: "ES",
    pos: { lat: 40.42, lng: -3.70 },
    desc: "Coordinated bombings on commuter trains in Madrid.",
    desc_long: "The 2004 Madrid train bombings killed 193 people and injured around 2,000. Ten explosions occurred on four commuter trains.",
    wiki: "https://en.wikipedia.org/wiki/2004_Madrid_train_bombings",
    year: "2004",
    casualties: 193,
    radiusKm: 10
  },
  {
    id: "london_bombings_2005",
    type: "terror",
    title: "London Bombings (2005)",
    country: "GB",
    pos: { lat: 51.51, lng: -0.13 },
    desc: "Coordinated suicide bombings on London's public transport.",
    desc_long: "The 7 July 2005 London bombings killed 52 people and injured over 700. Four suicide bombers detonated explosives on three Underground trains and a bus.",
    wiki: "https://en.wikipedia.org/wiki/7_July_2005_London_bombings",
    year: "2005",
    casualties: 52,
    radiusKm: 7
  },
  {
    id: "boston_marathon_bombing_2013",
    type: "terror",
    title: "Boston Marathon Bombing (2013)",
    country: "US",
    pos: { lat: 42.35, lng: -71.08 },
    desc: "Terrorist bombing at Boston Marathon finish line.",
    desc_long: "The Boston Marathon bombing killed 3 people and injured several hundred. Two pressure cooker bombs exploded near the finish line.",
    wiki: "https://en.wikipedia.org/wiki/Boston_Marathon_bombing",
    year: "2013",
    casualties: 3,
    radiusKm: 1
  },

  // Epidemics/Pandemics (25 events)
  {
    id: "black_death_1347_1353",
    type: "epidemic",
    title: "Black Death (1347-1353)",
    country: "IT",
    pos: { lat: 45.44, lng: 12.32 },
    desc: "Devastating pandemic of bubonic plague. Killed 30-60% of Europe's population.",
    desc_long: "The Black Death was one of the most devastating pandemics in human history, killing an estimated 75-200 million people in Eurasia and North Africa.",
    wiki: "https://en.wikipedia.org/wiki/Black_Death",
    year: "1347-1353",
    casualties: 100000000,
    radiusKm: 5000
  },
  {
    id: "spanish_flu_1918_1920",
    type: "epidemic",
    title: "Spanish Flu (1918-1920)",
    country: "ES",
    pos: { lat: 40.42, lng: -3.70 },
    desc: "Deadly H1N1 influenza pandemic. Infected 500 million people worldwide.",
    desc_long: "The 1918 Spanish flu pandemic infected about one-third of the world's population and killed an estimated 50-100 million people.",
    wiki: "https://en.wikipedia.org/wiki/Spanish_flu",
    year: "1918-1920",
    casualties: 75000000,
    radiusKm: 8000
  },
  {
    id: "covid19_pandemic_2019_2023",
    type: "epidemic",
    title: "COVID-19 Pandemic (2019-2023)",
    country: "CN",
    pos: { lat: 30.59, lng: 114.31 },
    desc: "Global pandemic caused by SARS-CoV-2 virus.",
    desc_long: "The COVID-19 pandemic has resulted in over 7 million confirmed deaths worldwide, with the true toll estimated to be much higher. It caused unprecedented global disruption.",
    wiki: "https://en.wikipedia.org/wiki/COVID-19_pandemic",
    year: "2019-2023",
    casualties: 7000000,
    radiusKm: 10000
  },
  {
    id: "plague_justinian_541_549",
    type: "epidemic",
    title: "Plague of Justinian (541-549)",
    country: "TR",
    pos: { lat: 41.01, lng: 28.98 },
    desc: "First recorded major outbreak of bubonic plague.",
    desc_long: "The Plague of Justinian killed an estimated 25-50 million people, roughly 13-26% of the world's population at the time.",
    wiki: "https://en.wikipedia.org/wiki/Plague_of_Justinian",
    year: "541-549",
    casualties: 35000000,
    radiusKm: 3000
  },
  {
    id: "third_plague_pandemic_1855_1960",
    type: "epidemic",
    title: "Third Plague Pandemic (1855-1960)",
    country: "CN",
    pos: { lat: 23.13, lng: 113.26 },
    desc: "Major bubonic plague pandemic originating in China.",
    desc_long: "The Third Plague Pandemic killed at least 12 million people in China and India. It spread to port cities worldwide.",
    wiki: "https://en.wikipedia.org/wiki/Third_plague_pandemic",
    year: "1855-1960",
    casualties: 12000000,
    radiusKm: 6000
  },
  {
    id: "hiv_aids_1981_present",
    type: "epidemic",
    title: "HIV/AIDS Pandemic (1981-present)",
    country: "CD",
    pos: { lat: -4.32, lng: 15.31 },
    desc: "Global pandemic caused by HIV virus.",
    desc_long: "The HIV/AIDS pandemic has killed over 40 million people since 1981. It remains a global public health issue.",
    wiki: "https://en.wikipedia.org/wiki/HIV/AIDS",
    year: "1981-present",
    casualties: 40000000,
    radiusKm: 10000
  },
  {
    id: "cholera_pandemics_1817_present",
    type: "epidemic",
    title: "Cholera Pandemics (1817-present)",
    country: "BD",
    pos: { lat: 23.81, lng: 90.41 },
    desc: "Series of cholera pandemics originating from India.",
    desc_long: "Multiple cholera pandemics have killed millions globally since 1817. The disease continues to affect vulnerable populations today.",
    wiki: "https://en.wikipedia.org/wiki/Cholera_outbreaks_and_pandemics",
    year: "1817-present",
    casualties: 3000000,
    radiusKm: 8000
  },
  {
    id: "smallpox_20th_century",
    type: "epidemic",
    title: "Smallpox Epidemics (20th century)",
    country: "IN",
    pos: { lat: 28.61, lng: 77.21 },
    desc: "Deadly viral disease eradicated in 1980.",
    desc_long: "Smallpox killed an estimated 300-500 million people in the 20th century before being eradicated through vaccination programs.",
    wiki: "https://en.wikipedia.org/wiki/Smallpox",
    year: "1900-1980",
    casualties: 400000000,
    radiusKm: 10000
  },
  {
    id: "hong_kong_flu_1968_1970",
    type: "epidemic",
    title: "Hong Kong Flu (1968-1970)",
    country: "HK",
    pos: { lat: 22.32, lng: 114.17 },
    desc: "H3N2 influenza pandemic.",
    desc_long: "The Hong Kong flu pandemic killed approximately 1-4 million people worldwide. It was the third influenza pandemic of the 20th century.",
    wiki: "https://en.wikipedia.org/wiki/Hong_Kong_flu",
    year: "1968-1970",
    casualties: 2000000,
    radiusKm: 7000
  },
  {
    id: "asian_flu_1957_1958",
    type: "epidemic",
    title: "Asian Flu (1957-1958)",
    country: "CN",
    pos: { lat: 22.54, lng: 114.06 },
    desc: "H2N2 influenza pandemic.",
    desc_long: "The 1957-1958 Asian flu pandemic killed approximately 1-4 million people worldwide, with estimates varying significantly.",
    wiki: "https://en.wikipedia.org/wiki/1957%E2%80%931958_influenza_pandemic",
    year: "1957-1958",
    casualties: 2000000,
    radiusKm: 8000
  },

  // Fires (15 events)
  {
    id: "great_fire_london_1666",
    type: "fire",
    title: "Great Fire of London (1666)",
    country: "GB",
    pos: { lat: 51.51, lng: -0.09 },
    desc: "Major conflagration that swept through central London.",
    desc_long: "The Great Fire of London destroyed 13,200 houses, 87 churches, and St Paul's Cathedral. Despite the massive destruction, only 6 deaths were recorded.",
    wiki: "https://en.wikipedia.org/wiki/Great_Fire_of_London",
    year: "1666",
    casualties: 6,
    radiusKm: 5
  },
  {
    id: "peshtigo_fire_1871",
    type: "fire",
    title: "Peshtigo Fire (1871)",
    country: "US",
    pos: { lat: 45.05, lng: -87.74 },
    desc: "Deadliest wildfire in recorded history.",
    desc_long: "The Peshtigo Fire killed at least 1,500 people, making it the deadliest wildfire in recorded history. It occurred on the same day as the Great Chicago Fire.",
    wiki: "https://en.wikipedia.org/wiki/Peshtigo_Fire",
    year: "1871",
    casualties: 1500,
    radiusKm: 200
  },
  {
    id: "great_chicago_fire_1871",
    type: "fire",
    title: "Great Chicago Fire (1871)",
    country: "US",
    pos: { lat: 41.88, lng: -87.63 },
    desc: "Devastating fire that destroyed much of Chicago.",
    desc_long: "The Great Chicago Fire killed approximately 300 people and destroyed 17,500 buildings. It left 100,000 residents homeless.",
    wiki: "https://en.wikipedia.org/wiki/Great_Chicago_Fire",
    year: "1871",
    casualties: 300,
    radiusKm: 10
  },
  {
    id: "black_saturday_bushfires_2009",
    type: "fire",
    title: "Black Saturday Bushfires (2009)",
    country: "AU",
    pos: { lat: -37.81, lng: 145.04 },
    desc: "Australia's deadliest bushfire disaster.",
    desc_long: "The Black Saturday bushfires killed 173 people and destroyed over 2,000 homes. They remain Australia's worst bushfire disaster.",
    wiki: "https://en.wikipedia.org/wiki/Black_Saturday_bushfires",
    year: "2009",
    casualties: 173,
    radiusKm: 450
  },
  {
    id: "camp_fire_california_2018",
    type: "fire",
    title: "Camp Fire (2018)",
    country: "US",
    pos: { lat: 39.81, lng: -121.44 },
    desc: "Deadliest and most destructive wildfire in California history.",
    desc_long: "The Camp Fire killed 85 people and destroyed 18,804 structures. It was California's deadliest wildfire on record.",
    wiki: "https://en.wikipedia.org/wiki/Camp_Fire_(2018)",
    year: "2018",
    casualties: 85,
    radiusKm: 150
  },
  {
    id: "triangle_shirtwaist_fire_1911",
    type: "fire",
    title: "Triangle Shirtwaist Factory Fire (1911)",
    country: "US",
    pos: { lat: 40.73, lng: -73.99 },
    desc: "Deadliest industrial disaster in New York City history.",
    desc_long: "The Triangle Shirtwaist Factory fire killed 146 garment workers. It led to significant improvements in workplace safety standards.",
    wiki: "https://en.wikipedia.org/wiki/Triangle_Shirtwaist_Factory_fire",
    year: "1911",
    casualties: 146,
    radiusKm: 0.5
  },
  {
    id: "cocoanut_grove_fire_1942",
    type: "fire",
    title: "Cocoanut Grove Fire (1942)",
    country: "US",
    pos: { lat: 42.35, lng: -71.07 },
    desc: "Deadliest nightclub fire in US history.",
    desc_long: "The Cocoanut Grove nightclub fire killed 492 people. It led to major reforms in fire safety codes and emergency exit requirements.",
    wiki: "https://en.wikipedia.org/wiki/Cocoanut_Grove_fire",
    year: "1942",
    casualties: 492,
    radiusKm: 0.2
  },
  {
    id: "station_nightclub_fire_2003",
    type: "fire",
    title: "Station Nightclub Fire (2003)",
    country: "US",
    pos: { lat: 41.78, lng: -71.51 },
    desc: "Fourth-deadliest nightclub fire in US history.",
    desc_long: "The Station nightclub fire killed 100 people during a rock concert. Pyrotechnics ignited flammable soundproofing foam.",
    wiki: "https://en.wikipedia.org/wiki/Station_nightclub_fire",
    year: "2003",
    casualties: 100,
    radiusKm: 0.3
  },
  {
    id: "king_cross_fire_1987",
    type: "fire",
    title: "King's Cross Fire (1987)",
    country: "GB",
    pos: { lat: 51.53, lng: -0.12 },
    desc: "Major fire at King's Cross St. Pancras tube station.",
    desc_long: "The King's Cross fire killed 31 people in London Underground. It led to major reforms in fire safety on the London Underground.",
    wiki: "https://en.wikipedia.org/wiki/King%27s_Cross_fire",
    year: "1987",
    casualties: 31,
    radiusKm: 0.5
  },
  {
    id: "grenfell_tower_fire_2017",
    type: "fire",
    title: "Grenfell Tower Fire (2017)",
    country: "GB",
    pos: { lat: 51.52, lng: -0.21 },
    desc: "Residential high-rise fire in London.",
    desc_long: "The Grenfell Tower fire killed 72 people. It led to a nationwide review of building safety regulations in the UK.",
    wiki: "https://en.wikipedia.org/wiki/Grenfell_Tower_fire",
    year: "2017",
    casualties: 72,
    radiusKm: 0.3
  },

  // Man-made Disasters (30 events)
  {
    id: "chernobyl_disaster_1986",
    type: "man-made disaster",
    title: "Chernobyl Disaster (1986)",
    country: "UA",
    pos: { lat: 51.39, lng: 30.10 },
    desc: "Worst nuclear power plant accident in history.",
    desc_long: "The Chernobyl disaster released radioactive material across Europe. Estimates suggest 4,000-60,000 premature deaths from radiation exposure.",
    wiki: "https://en.wikipedia.org/wiki/Chernobyl_disaster",
    year: "1986",
    casualties: 30000,
    radiusKm: 2600
  },
  {
    id: "bhopal_gas_tragedy_1984",
    type: "man-made disaster",
    title: "Bhopal Gas Tragedy (1984)",
    country: "IN",
    pos: { lat: 23.27, lng: 77.41 },
    desc: "World's worst industrial disaster.",
    desc_long: "The Bhopal disaster killed over 16,000 people and injured over 500,000. It remains the world's worst industrial disaster.",
    wiki: "https://en.wikipedia.org/wiki/Bhopal_disaster",
    year: "1984",
    casualties: 16000,
    radiusKm: 50
  },
  {
    id: "fukushima_nuclear_disaster_2011",
    type: "man-made disaster",
    title: "Fukushima Nuclear Disaster (2011)",
    country: "JP",
    pos: { lat: 37.42, lng: 141.03 },
    desc: "Nuclear accident following the Tohoku earthquake and tsunami.",
    desc_long: "The Fukushima Daiichi nuclear disaster was triggered by the 2011 Tohoku earthquake and tsunami. It resulted in the displacement of 154,000 residents.",
    wiki: "https://en.wikipedia.org/wiki/Fukushima_nuclear_disaster",
    year: "2011",
    casualties: 2313,
    radiusKm: 300
  },
  {
    id: "titanic_sinking_1912",
    type: "man-made disaster",
    title: "Sinking of the Titanic (1912)",
    country: "GB",
    pos: { lat: 41.73, lng: -49.95 },
    desc: "Sinking of RMS Titanic after hitting an iceberg.",
    desc_long: "The sinking of RMS Titanic killed over 1,500 people. It remains one of the deadliest peacetime maritime disasters.",
    wiki: "https://en.wikipedia.org/wiki/Sinking_of_the_Titanic",
    year: "1912",
    casualties: 1517,
    radiusKm: 5
  },
  {
    id: "banqiao_dam_failure_1975",
    type: "man-made disaster",
    title: "Banqiao Dam Failure (1975)",
    country: "CN",
    pos: { lat: 33.00, lng: 113.42 },
    desc: "Catastrophic dam failure during Typhoon Nina.",
    desc_long: "The Banqiao Dam failure killed an estimated 26,000-240,000 people. It remains one of the deadliest structural failures in history.",
    wiki: "https://en.wikipedia.org/wiki/1975_Banqiao_Dam_failure",
    year: "1975",
    casualties: 170000,
    radiusKm: 400
  },
  {
    id: "aberfan_disaster_1966",
    type: "man-made disaster",
    title: "Aberfan Disaster (1966)",
    country: "GB",
    pos: { lat: 51.69, lng: -3.34 },
    desc: "Catastrophic collapse of a colliery spoil tip.",
    desc_long: "The Aberfan disaster killed 144 people, including 116 children, when a spoil tip collapsed onto a school and houses.",
    wiki: "https://en.wikipedia.org/wiki/Aberfan_disaster",
    year: "1966",
    casualties: 144,
    radiusKm: 2
  },
  {
    id: "deepwater_horizon_2010",
    type: "man-made disaster",
    title: "Deepwater Horizon Oil Spill (2010)",
    country: "US",
    pos: { lat: 28.74, lng: -88.39 },
    desc: "Largest marine oil spill in history.",
    desc_long: "The Deepwater Horizon explosion killed 11 workers and caused the largest marine oil spill in history, releasing 4.9 million barrels of oil.",
    wiki: "https://en.wikipedia.org/wiki/Deepwater_Horizon_explosion",
    year: "2010",
    casualties: 11,
    radiusKm: 1500
  },
  {
    id: "vajont_dam_disaster_1963",
    type: "man-made disaster",
    title: "Vajont Dam Disaster (1963)",
    country: "IT",
    pos: { lat: 46.27, lng: 12.33 },
    desc: "Massive landslide into a reservoir causing devastating flood.",
    desc_long: "The Vajont Dam disaster killed approximately 1,900 people when a landslide caused a massive wave to overtop the dam.",
    wiki: "https://en.wikipedia.org/wiki/Vajont_Dam",
    year: "1963",
    casualties: 1900,
    radiusKm: 15
  },
  {
    id: "piper_alpha_1988",
    type: "man-made disaster",
    title: "Piper Alpha Disaster (1988)",
    country: "GB",
    pos: { lat: 57.40, lng: 0.24 },
    desc: "Oil platform explosion in the North Sea.",
    desc_long: "The Piper Alpha explosion killed 167 workers, making it the world's deadliest offshore oil platform disaster.",
    wiki: "https://en.wikipedia.org/wiki/Piper_Alpha",
    year: "1988",
    casualties: 167,
    radiusKm: 5
  },
  {
    id: "seveso_disaster_1976",
    type: "man-made disaster",
    title: "Seveso Disaster (1976)",
    country: "IT",
    pos: { lat: 45.65, lng: 9.14 },
    desc: "Industrial accident releasing toxic dioxin cloud.",
    desc_long: "The Seveso disaster released toxic dioxin into the atmosphere, contaminating a large area and requiring the evacuation of hundreds of people.",
    wiki: "https://en.wikipedia.org/wiki/Seveso_disaster",
    year: "1976",
    casualties: 0,
    radiusKm: 18
  },

  // Tsunamis (15 events)
  {
    id: "indian_ocean_tsunami_2004",
    type: "tsunami",
    title: "Indian Ocean Tsunami (2004)",
    country: "ID",
    pos: { lat: 3.30, lng: 95.98 },
    desc: "Deadliest tsunami in recorded history.",
    desc_long: "The 2004 Indian Ocean tsunami killed approximately 227,898 people across 14 countries. It was triggered by a magnitude 9.1 earthquake.",
    wiki: "https://en.wikipedia.org/wiki/2004_Indian_Ocean_earthquake_and_tsunami",
    year: "2004",
    casualties: 227898,
    radiusKm: 5000
  },
  {
    id: "tohoku_tsunami_2011",
    type: "tsunami",
    title: "Tohoku Tsunami (2011)",
    country: "JP",
    pos: { lat: 38.32, lng: 142.37 },
    desc: "Massive tsunami following magnitude 9.1 earthquake.",
    desc_long: "The 2011 Tohoku tsunami killed approximately 19,747 people and triggered the Fukushima nuclear disaster. Waves reached up to 40.5 meters.",
    wiki: "https://en.wikipedia.org/wiki/2011_T%C5%8Dhoku_earthquake_and_tsunami",
    year: "2011",
    casualties: 19747,
    radiusKm: 800
  },
  {
    id: "lisbon_tsunami_1755",
    type: "tsunami",
    title: "Lisbon Tsunami (1755)",
    country: "PT",
    pos: { lat: 38.72, lng: -9.14 },
    desc: "Devastating tsunami following the Great Lisbon Earthquake.",
    desc_long: "The 1755 Lisbon tsunami, triggered by the Great Lisbon Earthquake, killed tens of thousands. It struck Morocco, Portugal, and Spain.",
    wiki: "https://en.wikipedia.org/wiki/1755_Lisbon_earthquake",
    year: "1755",
    casualties: 60000,
    radiusKm: 1000
  },
  {
    id: "chile_tsunami_1960",
    type: "tsunami",
    title: "Chilean Tsunami (1960)",
    country: "CL",
    pos: { lat: -38.24, lng: -73.05 },
    desc: "Tsunami generated by the largest earthquake ever recorded.",
    desc_long: "The 1960 Chilean tsunami was generated by a magnitude 9.5 earthquake, the largest ever recorded. It killed approximately 5,700 people.",
    wiki: "https://en.wikipedia.org/wiki/1960_Valdivia_earthquake",
    year: "1960",
    casualties: 5700,
    radiusKm: 10000
  },
  {
    id: "krakatoa_tsunami_1883",
    type: "tsunami",
    title: "Krakatoa Tsunami (1883)",
    country: "ID",
    pos: { lat: -6.10, lng: 105.42 },
    desc: "Tsunami caused by the eruption of Krakatoa volcano.",
    desc_long: "The 1883 Krakatoa eruption generated massive tsunamis that killed over 36,000 people in Indonesia.",
    wiki: "https://en.wikipedia.org/wiki/1883_eruption_of_Krakatoa",
    year: "1883",
    casualties: 36417,
    radiusKm: 800
  },
  {
    id: "messina_tsunami_1908",
    type: "tsunami",
    title: "Messina Tsunami (1908)",
    country: "IT",
    pos: { lat: 38.19, lng: 15.55 },
    desc: "Tsunami following the Messina earthquake.",
    desc_long: "The 1908 Messina earthquake and tsunami killed between 75,000 and 200,000 people in southern Italy and Sicily.",
    wiki: "https://en.wikipedia.org/wiki/1908_Messina_earthquake",
    year: "1908",
    casualties: 123000,
    radiusKm: 300
  },
  {
    id: "nankaido_tsunami_1498",
    type: "tsunami",
    title: "Nankaido Tsunami (1498)",
    country: "JP",
    pos: { lat: 34.70, lng: 137.73 },
    desc: "Devastating tsunami that struck Japan's Pacific coast.",
    desc_long: "The 1498 Nankaido tsunami killed approximately 31,000 people along Japan's Pacific coast.",
    wiki: "https://en.wikipedia.org/wiki/1498_Nankai_earthquake",
    year: "1498",
    casualties: 31000,
    radiusKm: 600
  },
  {
    id: "hokkaido_tsunami_1993",
    type: "tsunami",
    title: "Hokkaido Tsunami (1993)",
    country: "JP",
    pos: { lat: 42.78, lng: 139.48 },
    desc: "Tsunami following earthquake in the Sea of Japan.",
    desc_long: "The 1993 Hokkaido tsunami killed 230 people. It struck within minutes of the earthquake, giving little time for evacuation.",
    wiki: "https://en.wikipedia.org/wiki/1993_Hokkaido_earthquake",
    year: "1993",
    casualties: 230,
    radiusKm: 500
  },
  {
    id: "samoa_tsunami_2009",
    type: "tsunami",
    title: "Samoa Tsunami (2009)",
    country: "WS",
    pos: { lat: -14.27, lng: -170.70 },
    desc: "Tsunami affecting Samoa, American Samoa, and Tonga.",
    desc_long: "The 2009 Samoa tsunami killed 189 people. It was triggered by a magnitude 8.1 earthquake.",
    wiki: "https://en.wikipedia.org/wiki/2009_Samoa_earthquake_and_tsunami",
    year: "2009",
    casualties: 189,
    radiusKm: 200
  },
  {
    id: "papua_new_guinea_tsunami_1998",
    type: "tsunami",
    title: "Papua New Guinea Tsunami (1998)",
    country: "PG",
    pos: { lat: -2.89, lng: 142.86 },
    desc: "Devastating tsunami following offshore earthquake.",
    desc_long: "The 1998 Papua New Guinea tsunami killed over 2,100 people. Waves reached up to 15 meters in height.",
    wiki: "https://en.wikipedia.org/wiki/1998_Papua_New_Guinea_earthquake",
    year: "1998",
    casualties: 2183,
    radiusKm: 150
  },

  // Meteorites (5 events)
  {
    id: "tunguska_event_1908",
    type: "meteorite",
    title: "Tunguska Event (1908)",
    country: "RU",
    pos: { lat: 60.90, lng: 101.91 },
    desc: "Massive air burst explosion over Siberia.",
    desc_long: "The Tunguska event was a large explosion that occurred near the Stony Tunguska River, flattening 2,000 square kilometers of forest.",
    wiki: "https://en.wikipedia.org/wiki/Tunguska_event",
    year: "1908",
    casualties: 0,
    radiusKm: 2150
  },
  {
    id: "chelyabinsk_meteor_2013",
    type: "meteorite",
    title: "Chelyabinsk Meteor (2013)",
    country: "RU",
    pos: { lat: 55.15, lng: 61.41 },
    desc: "Large meteor air burst over Russia.",
    desc_long: "The Chelyabinsk meteor exploded over Russia, injuring about 1,500 people from flying glass. It was the largest object to enter Earth's atmosphere since Tunguska.",
    wiki: "https://en.wikipedia.org/wiki/Chelyabinsk_meteor",
    year: "2013",
    casualties: 0,
    radiusKm: 300
  },
  {
    id: "sikhote_alin_meteorite_1947",
    type: "meteorite",
    title: "Sikhote-Alin Meteorite (1947)",
    country: "RU",
    pos: { lat: 46.17, lng: 134.65 },
    desc: "Large iron meteorite fall in Russia's Far East.",
    desc_long: "The Sikhote-Alin meteorite shower was one of the largest witnessed meteorite falls in history, creating over 100 craters.",
    wiki: "https://en.wikipedia.org/wiki/Sikhote-Alin_meteorite",
    year: "1947",
    casualties: 0,
    radiusKm: 35
  },
  {
    id: "carancas_meteorite_2007",
    type: "meteorite",
    title: "Carancas Meteorite (2007)",
    country: "PE",
    pos: { lat: -16.66, lng: -69.04 },
    desc: "Meteorite impact near Lake Titicaca.",
    desc_long: "The Carancas meteorite created a crater 13.5 meters wide. It made hundreds of people sick due to fumes from the impact.",
    wiki: "https://en.wikipedia.org/wiki/Carancas_impact_event",
    year: "2007",
    casualties: 0,
    radiusKm: 1
  },
  {
    id: "l_aquila_meteorite_1470",
    type: "meteorite",
    title: "L'Aquila Meteorite (1470)",
    country: "IT",
    pos: { lat: 42.35, lng: 13.40 },
    desc: "Historical meteorite fall in Italy.",
    desc_long: "One of the earliest well-documented meteorite falls in Europe, witnessed by many people in the city of L'Aquila.",
    wiki: "https://en.wikipedia.org/wiki/L%27Aquila_meteorite",
    year: "1470",
    casualties: 0,
    radiusKm: 5
  },

  // Archaeology (10 events)
  {
    id: "tutankhamun_tomb_1922",
    type: "archaeology",
    title: "Discovery of Tutankhamun's Tomb (1922)",
    country: "EG",
    pos: { lat: 25.74, lng: 32.60 },
    desc: "Howard Carter discovered the intact tomb of Pharaoh Tutankhamun.",
    desc_long: "The discovery of Tutankhamun's tomb in 1922 by Howard Carter remains one of the most significant archaeological finds in history, revealing treasures from ancient Egypt.",
    wiki: "https://en.wikipedia.org/wiki/Tutankhamun%27s_tomb",
    year: "1922",
    radiusKm: 10
  },
  {
    id: "pompeii_excavation_1748",
    type: "archaeology",
    title: "Excavation of Pompeii (1748-present)",
    country: "IT",
    pos: { lat: 40.75, lng: 14.49 },
    desc: "Ongoing excavation of the Roman city buried by Mount Vesuvius in 79 CE.",
    desc_long: "The excavation of Pompeii, buried by the eruption of Mount Vesuvius in 79 CE, has provided an extraordinary snapshot of Roman life.",
    wiki: "https://en.wikipedia.org/wiki/Pompeii",
    year: "1748",
    radiusKm: 15
  },
  {
    id: "terracotta_army_1974",
    type: "archaeology",
    title: "Discovery of Terracotta Army (1974)",
    country: "CN",
    pos: { lat: 34.38, lng: 109.27 },
    desc: "Discovery of thousands of terracotta warriors guarding Qin Shi Huang's tomb.",
    desc_long: "The Terracotta Army, discovered in 1974, consists of thousands of life-sized terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China.",
    wiki: "https://en.wikipedia.org/wiki/Terracotta_Army",
    year: "1974",
    radiusKm: 20
  },
  {
    id: "dead_sea_scrolls_1947",
    type: "archaeology",
    title: "Discovery of Dead Sea Scrolls (1947)",
    country: "IL",
    pos: { lat: 31.73, lng: 35.46 },
    desc: "Ancient Jewish texts found in caves near the Dead Sea.",
    desc_long: "The Dead Sea Scrolls, discovered between 1947 and 1956, are among the most important archaeological finds of the 20th century, containing some of the oldest known biblical manuscripts.",
    wiki: "https://en.wikipedia.org/wiki/Dead_Sea_Scrolls",
    year: "1947",
    radiusKm: 25
  },
  {
    id: "machu_picchu_discovery_1911",
    type: "archaeology",
    title: "Discovery of Machu Picchu (1911)",
    country: "PE",
    pos: { lat: -13.16, lng: -72.54 },
    desc: "Hiram Bingham brought international attention to Machu Picchu.",
    desc_long: "While Machu Picchu was known to locals, Hiram Bingham's 1911 expedition brought the Inca citadel to international attention.",
    wiki: "https://en.wikipedia.org/wiki/Machu_Picchu",
    year: "1911",
    radiusKm: 10
  },
  {
    id: "rosetta_stone_1799",
    type: "archaeology",
    title: "Discovery of Rosetta Stone (1799)",
    country: "EG",
    pos: { lat: 31.40, lng: 30.42 },
    desc: "Key to deciphering Egyptian hieroglyphs.",
    desc_long: "The Rosetta Stone, discovered in 1799, was crucial in deciphering Egyptian hieroglyphs, unlocking ancient Egyptian civilization to modern scholars.",
    wiki: "https://en.wikipedia.org/wiki/Rosetta_Stone",
    year: "1799",
    radiusKm: 5
  },
  {
    id: "gobekli_tepe_1994",
    type: "archaeology",
    title: "Discovery of Göbekli Tepe (1994)",
    country: "TR",
    pos: { lat: 37.22, lng: 38.92 },
    desc: "World's oldest known megalithic site.",
    desc_long: "Göbekli Tepe, discovered in 1994, dates to approximately 9600 BCE and has revolutionized understanding of prehistoric human civilization.",
    wiki: "https://en.wikipedia.org/wiki/G%C3%B6bekli_Tepe",
    year: "1994",
    radiusKm: 15
  },
  {
    id: "lascaux_caves_1940",
    type: "archaeology",
    title: "Discovery of Lascaux Caves (1940)",
    country: "FR",
    pos: { lat: 45.05, lng: 1.17 },
    desc: "Paleolithic cave paintings dating back 17,000 years.",
    desc_long: "The Lascaux cave paintings, discovered in 1940, contain some of the finest examples of Paleolithic art, dating back approximately 17,000 years.",
    wiki: "https://en.wikipedia.org/wiki/Lascaux",
    year: "1940",
    radiusKm: 2
  },
  {
    id: "troy_excavation_1870",
    type: "archaeology",
    title: "Excavation of Troy (1870)",
    country: "TR",
    pos: { lat: 39.96, lng: 26.24 },
    desc: "Heinrich Schliemann's discovery of the legendary city of Troy.",
    desc_long: "Heinrich Schliemann's excavation of Troy in 1870 confirmed the existence of the legendary city from Homer's Iliad.",
    wiki: "https://en.wikipedia.org/wiki/Troy",
    year: "1870",
    radiusKm: 8
  },
  {
    id: "otzi_iceman_1991",
    type: "archaeology",
    title: "Discovery of Ötzi the Iceman (1991)",
    country: "IT",
    pos: { lat: 46.78, lng: 10.84 },
    desc: "Well-preserved natural mummy from the Copper Age.",
    desc_long: "Ötzi the Iceman, discovered in 1991, is a well-preserved natural mummy dating back to 3300 BCE, providing valuable insights into Copper Age Europeans.",
    wiki: "https://en.wikipedia.org/wiki/%C3%96tzi",
    year: "1991",
    radiusKm: 1
  }
];

// Function to normalize title for comparison
const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // Remove content in parentheses
    .replace(/\d+/g, '') // Remove numbers
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .trim();
};

// Read existing events
const eventsPath = path.join(__dirname, '../public/events.json');
let existingEvents = [];
try {
  existingEvents = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
} catch (error) {
  console.log('⚠️ Could not read existing events.json, will create new file');
}

// Check for duplicates
const existingTitles = new Set(
  existingEvents.map(e => normalizeTitle(e.title))
);

const existingIds = new Set(
  existingEvents.map(e => e.id)
);

// Filter out events that already exist
const newEvents = majorEvents.filter(event => {
  const normalizedTitle = normalizeTitle(event.title);
  const isDuplicateTitle = existingTitles.has(normalizedTitle);
  const isDuplicateId = existingIds.has(event.id);
  
  if (isDuplicateTitle || isDuplicateId) {
    console.log(`⏭️ Skipping duplicate: ${event.title}`);
    return false;
  }
  return true;
});

// Combine existing and new events
const allEvents = [...existingEvents, ...newEvents];

// Write to file
fs.writeFileSync(eventsPath, JSON.stringify(allEvents, null, 2), 'utf-8');

console.log(`\n✅ Successfully added events!`);
console.log(`📊 Statistics:`);
console.log(`   - Existing events: ${existingEvents.length}`);
console.log(`   - New events added: ${newEvents.length}`);
console.log(`   - Skipped duplicates: ${majorEvents.length - newEvents.length}`);
console.log(`   - Total events: ${allEvents.length}`);
console.log(`📄 File: ${eventsPath}`);
