const fs = require('fs');

// Valid event types
const validTypes = [
  'war',
  'earthquake', 
  'terror',
  'archaeology',
  'fire',
  'disaster',
  'tsunami',
  'meteorite',
  'epidemic',
  'man-made disaster'
];

// Read events
const events = JSON.parse(fs.readFileSync('public/events.json', 'utf-8'));

// Find invalid types
const typeMap = new Map();
events.forEach(event => {
  const type = event.type || 'NO_TYPE';
  if (!typeMap.has(type)) {
    typeMap.set(type, []);
  }
  typeMap.get(type).push(event);
});

console.log('\n===== TYPE ANALYSIS =====\n');
typeMap.forEach((events, type) => {
  const isValid = validTypes.includes(type);
  console.log(`${type}: ${events.length} events ${!isValid ? '❌ INVALID' : '✅'}`);
  if (!isValid) {
    console.log(`  Examples:` );
    events.slice(0, 5).forEach(e => {
      console.log(`    - ${e.title} (${e.id})`);
    });
  }
});

// Fix invalid types
let fixed = 0;
events.forEach(event => {
  if (!validTypes.includes(event.type)) {
    console.log(`\nFixing: ${event.title}`);
    console.log(`  Current type: ${event.type}`);
    
    // Categorization logic based on title/description
    const titleLower = event.title.toLowerCase();
    const descLower = (event.desc || '').toLowerCase();
    
    if (titleLower.includes('war') || titleLower.includes('battle') || titleLower.includes('invasion') || 
        titleLower.includes('siege') || titleLower.includes('conflict') || titleLower.includes('revolt') ||
        titleLower.includes('rebellion') || titleLower.includes('military')) {
      event.type = 'war';
    } else if (titleLower.includes('earthquake') || titleLower.includes('quake')) {
      event.type = 'earthquake';
    } else if (titleLower.includes('fire') || titleLower.includes('burning')) {
      event.type = 'fire';
    } else if (titleLower.includes('tsunami') || titleLower.includes('tidal wave')) {
      event.type = 'tsunami';
    } else if (titleLower.includes('plague') || titleLower.includes('epidemic') || titleLower.includes('pandemic') ||
               titleLower.includes('disease') || titleLower.includes('outbreak') || titleLower.includes('virus')) {
      event.type = 'epidemic';
    } else if (titleLower.includes('terror') || titleLower.includes('attack') || titleLower.includes('bombing') ||
               titleLower.includes('assassination')) {
      event.type = 'terror';
    } else if (titleLower.includes('meteor') || titleLower.includes('asteroid') || titleLower.includes('comet')) {
      event.type = 'meteorite';
    } else if (titleLower.includes('flood') || titleLower.includes('hurricane') || titleLower.includes('cyclone') ||
               titleLower.includes('typhoon') || titleLower.includes('storm') || titleLower.includes('volcano') ||
               titleLower.includes('eruption') || titleLower.includes('avalanche') || titleLower.includes('landslide')) {
      event.type = 'disaster';
    } else if (titleLower.includes('accident') || titleLower.includes('explosion') || titleLower.includes('collapse') ||
               titleLower.includes('crash') || titleLower.includes('spill') || titleLower.includes('leak') ||
               titleLower.includes('nuclear') || titleLower.includes('chemical')) {
      event.type = 'man-made disaster';
    } else if (titleLower.includes('discovery') || titleLower.includes('found') || titleLower.includes('tomb') ||
               titleLower.includes('ancient') || titleLower.includes('ruins') || titleLower.includes('artifact') ||
               titleLower.includes('excavation') || titleLower.includes('archaeological')) {
      event.type = 'archaeology';
    } else {
      // Default fallback
      event.type = 'archaeology'; // Use archaeology as default for historical events
    }
    
    console.log(`  New type: ${event.type}`);
    fixed++;
  }
});

// Write back
fs.writeFileSync('public/events.json', JSON.stringify(events, null, 2));

console.log(`\n✅ Fixed ${fixed} events with invalid types`);
console.log(`Total events: ${events.length}`);
