import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events
const eventsPath = path.join(__dirname, '../public/events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

// Known casualties for major tsunami events
const tsunamiCasualties = {
  'indianocean_tsunami_2004_area': 227898,
  'indian_ocean_2004_event': 227898,
  'tohoku_tsunami_2011': 18500,
  'tohoku_tsunami_inundation_2011': 18500,
  'lisbon_1755_quake_tsunami': 60000,
  'lisboa1755_tsunami_area': 60000,
  'chile_1960_tsunami_chatgpt': 5700,
  'alaska_1964_tsunami_chatgpt': 131,
  'krakatoa_1883_tsunami_chatgpt': 36000,
  'cascadia_1700_tsunami_chatgpt': 1000,
  'sulawesi_2018_palu_tsunami_chatgpt': 4340,
  'samoa_2009_tsunami_chatgpt': 189,
  'sanriku_tsunami_1896': 22000,
  'arica_tsunami_1868': 25000,
  'moro_gulf_tsunami_1976': 8000,
  'png_tsunami_1998': 2183,
  'java_tsunami_2006': 668,
  'mentawai_tsunami_2010': 435,
  'andaman_tsunami_2023': 400
};

// Known casualties for other events
const otherCasualties = {
  // Disasters
  'laki_eruption_1783': 6000,
  'tambora_1815': 71000,
  'peshtigo_fire_1871': 1500,
  'chicago_fire_1871': 300,
  'great_london_fire_1666': 6,
  'tangshan_earthquake_1976': 242000,
  'haitian_earthquake_2010': 316000,
  'sichuan_earthquake_2008': 87587,
  'kanto_earthquake_1923': 142800,
  'shaanxi_earthquake_1556': 830000,
  
  // Fires
  'australian_bushfires_2019_2020': 34,
  'camp_fire_2018': 85,
  'california_fires_2017': 46,
  'portugal_fires_2017': 66,
  'greece_fires_2018': 102,
  
  // Meteorites
  'tunguska_event_1908': 0,
  'chelyabinsk_meteor_2013': 0,
  
  // Man-made disasters
  'bhopal_gas_tragedy_1984': 3787,
  'seveso_disaster_1976': 0,
  'fukushima_nuclear_2011': 0,
  'chernobyl_1986': 31
};

// Combine all casualties data
const allCasualties = { ...tsunamiCasualties, ...otherCasualties };

let updatedCount = 0;
let addedCount = 0;

events.forEach(event => {
  if (allCasualties[event.id] !== undefined) {
    const casualties = allCasualties[event.id];
    
    if (event.casualties === undefined) {
      console.log(`✅ Adding casualties to ${event.id}: ${casualties.toLocaleString()}`);
      event.casualties = casualties;
      addedCount++;
    } else if (event.casualties === 0 && casualties > 0) {
      console.log(`🔄 Updating casualties for ${event.id}: ${event.casualties} → ${casualties.toLocaleString()}`);
      event.casualties = casualties;
      updatedCount++;
    }
  }
});

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

console.log(`\n✅ Done!`);
console.log(`   Added casualties: ${addedCount}`);
console.log(`   Updated casualties: ${updatedCount}`);
console.log(`   Total processed: ${addedCount + updatedCount}`);

// Verify tsunami casualties
const tsunamiEvents = events.filter(e => e.type === 'tsunami');
const tsunamiWithCasualties = tsunamiEvents.filter(e => e.casualties && e.casualties > 0);
const totalTsunamiCasualties = tsunamiEvents.reduce((sum, e) => sum + (e.casualties || 0), 0);

console.log(`\n📊 Tsunami Statistics:`);
console.log(`   Total tsunami events: ${tsunamiEvents.length}`);
console.log(`   Events with casualties: ${tsunamiWithCasualties.length}`);
console.log(`   Total tsunami casualties: ${totalTsunamiCasualties.toLocaleString()}`);
