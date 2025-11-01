import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '../public/events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`Total events before: ${events.length}`);

// Update existing World War I
const ww1Index = events.findIndex(e => e.id === 'world_war_1_global_1914_1918');
if (ww1Index !== -1) {
  events[ww1Index] = {
    ...events[ww1Index],
    year: "1914-1918",
    desc_long: "The Great War involved over 30 nations and resulted in over 17 million deaths. Major fronts included Western Front (France/Belgium), Eastern Front (Russia), and Middle East. The war introduced trench warfare, chemical weapons, tanks, and aircraft to modern combat.",
    casualties: 17000000
  };
  console.log('✅ Updated World War I');
}

// Update existing World War II
const ww2Index = events.findIndex(e => e.id === 'world_war_2_global_1939_1945');
if (ww2Index !== -1) {
  events[ww2Index] = {
    ...events[ww2Index],
    year: "1939-1945",
    desc_long: "The deadliest military conflict in history involved over 100 million people from more than 30 countries. Major theaters included Europe, Pacific, North Africa, and Asia. The war resulted in 70-85 million deaths, including the Holocaust, and ended with nuclear weapons.",
    casualties: 75000000
  };
  console.log('✅ Updated World War II');
}

// Update Pearl Harbor
const pearlIndex = events.findIndex(e => e.id === 'pearl_harbor_1941');
if (pearlIndex !== -1) {
  events[pearlIndex] = {
    ...events[pearlIndex],
    year: "1941",
    casualties: 2403
  };
  console.log('✅ Updated Pearl Harbor');
}

// Add nuclear test sites (military polygons)
const newEvents = [
  {
    id: "semipalatinsk_test_site",
    type: "war",
    title: "Semipalatinsk Nuclear Test Site (1949-1989)",
    country: "KZ",
    pos: { lat: 50.07, lng: 78.87 },
    desc: "Soviet nuclear test site, 456 tests conducted.",
    desc_long: "The Semipalatinsk Test Site in Kazakhstan was the primary nuclear testing venue for the Soviet Union. Between 1949 and 1989, at least 456 nuclear tests were conducted, including 340 underground and 116 atmospheric tests. The site caused severe health and environmental damage to local populations.",
    wiki: "https://en.wikipedia.org/wiki/Semipalatinsk_Test_Site",
    radiusKm: 150,
    year: "1949-1989"
  },
  {
    id: "bikini_atoll_tests",
    type: "war",
    title: "Bikini Atoll Nuclear Tests (1946-1958)",
    country: "MH",
    pos: { lat: 11.6, lng: 165.4 },
    desc: "US nuclear test site, 23 tests including Castle Bravo.",
    desc_long: "Bikini Atoll in the Marshall Islands was the site of 23 nuclear weapons tests between 1946 and 1958. The most powerful was Castle Bravo in 1954, the largest US nuclear test ever conducted. The tests displaced the native population and rendered the islands uninhabitable.",
    wiki: "https://en.wikipedia.org/wiki/Nuclear_testing_at_Bikini_Atoll",
    radiusKm: 100,
    year: "1946-1958",
    casualties: 0
  },
  {
    id: "novaya_zemlya_test_site",
    type: "war",
    title: "Novaya Zemlya Test Site (1954-1990)",
    country: "RU",
    pos: { lat: 73.3, lng: 54.9 },
    desc: "Soviet Arctic test site, Tsar Bomba tested here.",
    desc_long: "Novaya Zemlya in the Russian Arctic was used for 224 nuclear tests, including the most powerful nuclear weapon ever detonated - the Tsar Bomba (50 megatons) in 1961. The remote location was chosen to minimize population exposure.",
    wiki: "https://en.wikipedia.org/wiki/Novaya_Zemlya",
    radiusKm: 200,
    year: "1954-1990"
  },
  {
    id: "nevada_test_site",
    type: "war",
    title: "Nevada Test Site (1951-1992)",
    country: "US",
    pos: { lat: 37.12, lng: -116.05 },
    desc: "US continental nuclear test site, 928 tests.",
    desc_long: "The Nevada Test Site, 65 miles northwest of Las Vegas, was the primary domestic testing location for US nuclear weapons. Between 1951 and 1992, 928 nuclear tests were conducted - 828 underground and 100 atmospheric. Atmospheric tests were visible from Las Vegas.",
    wiki: "https://en.wikipedia.org/wiki/Nevada_Test_Site",
    radiusKm: 120,
    year: "1951-1992"
  },
  {
    id: "mururoa_atoll_tests",
    type: "war",
    title: "Mururoa Atoll Nuclear Tests (1966-1996)",
    country: "PF",
    pos: { lat: -21.83, lng: -138.88 },
    desc: "French nuclear test site in Pacific, 181 tests.",
    desc_long: "Mururoa Atoll in French Polynesia was used by France for 181 nuclear weapons tests between 1966 and 1996. The tests caused significant environmental damage and health issues for local populations. France conducted both atmospheric and underground tests here.",
    wiki: "https://en.wikipedia.org/wiki/Moruroa",
    radiusKm: 80,
    year: "1966-1996"
  },
  {
    id: "lop_nur_test_site",
    type: "war",
    title: "Lop Nur Nuclear Test Site (1964-1996)",
    country: "CN",
    pos: { lat: 40.5, lng: 90.3 },
    desc: "Chinese nuclear test site, 45 tests conducted.",
    desc_long: "Lop Nur in Xinjiang, China was the site of 45 nuclear tests between 1964 and 1996, beginning with China's first nuclear test. The remote desert location allowed China to develop its nuclear arsenal. The area remains contaminated and restricted.",
    wiki: "https://en.wikipedia.org/wiki/Lop_Nur",
    radiusKm: 130,
    year: "1964-1996"
  }
];

// Check and add new events
newEvents.forEach(event => {
  const exists = events.find(e => e.id === event.id);
  if (!exists) {
    events.push(event);
    console.log(`✅ Added: ${event.title}`);
  } else {
    console.log(`⏭️  Already exists: ${event.title}`);
  }
});

console.log(`Total events after: ${events.length}`);

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

console.log('\n✅ Successfully updated major wars and added nuclear test sites!');
